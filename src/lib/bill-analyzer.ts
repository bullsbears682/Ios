// Nebenkostenabrechnung Analysis Engine
import { GermanCity, lookupPLZ } from './german-cities';
import { energyService, RegionalEnergyData } from './energy-apis';
import { getTranslations, Language } from './i18n';
import { OCRPreprocessor } from './ocr-preprocessor';

export interface BillData {
  // Extracted from OCR
  totalAmount: number;
  period: {
    start: string;
    end: string;
  };
  apartmentSize: number; // m²
  costs: {
    heating: number;      // Total €
    water: number;        // Total €
    waste: number;        // Total €
    maintenance: number;  // Total €
    electricity: number;  // Total €
    other: number;        // Total €
  };
  plz: string;
  address: string;
}

export interface AnalysisResult {
  userCosts: {
    heating: number;      // €/m²/month
    water: number;        // €/m²/month
    waste: number;        // €/m²/month
    maintenance: number;  // €/m²/month
    total: number;        // €/m²/month
  };
  regionalAverages: {
    heating: number;
    water: number;
    waste: number;
    maintenance: number;
    total: number;
  };
  comparisons: {
    heating: ComparisonResult;
    water: ComparisonResult;
    waste: ComparisonResult;
    maintenance: ComparisonResult;
    total: ComparisonResult;
  };
  savings: {
    potential: number;    // € per year
    recommendations: string[];
  };
  cityInfo: GermanCity;
  energyData: RegionalEnergyData;
  confidence: number;   // 0-100% accuracy confidence
}

export interface ComparisonResult {
  percentage: number;   // % above/below average
  status: 'low' | 'average' | 'high' | 'very_high';
  message: string;
}

export class NebenkostenAnalyzer {
  async analyzeBill(billData: BillData, language: Language = 'de'): Promise<AnalysisResult> {
    // Get city and energy data
    const [cityInfo, energyData] = await Promise.all([
      lookupPLZ(billData.plz),
      energyService.getRegionalEnergyData(billData.plz)
    ]);

    if (!cityInfo) {
      throw new Error(`Unbekannte Postleitzahl: ${billData.plz}`);
    }

    // Calculate per m² monthly costs
    const monthsInPeriod = this.calculateMonthsInPeriod(billData.period);
    const userCosts = {
      heating: billData.costs.heating / billData.apartmentSize / monthsInPeriod,
      water: billData.costs.water / billData.apartmentSize / monthsInPeriod,
      waste: billData.costs.waste / billData.apartmentSize / monthsInPeriod,
      maintenance: billData.costs.maintenance / billData.apartmentSize / monthsInPeriod,
      total: (billData.totalAmount - billData.costs.electricity) / billData.apartmentSize / monthsInPeriod
    };

    // Compare with regional averages
    const comparisons = {
      heating: this.compareWithAverage(userCosts.heating, cityInfo.avgCosts.heating),
      water: this.compareWithAverage(userCosts.water, cityInfo.avgCosts.water),
      waste: this.compareWithAverage(userCosts.waste, cityInfo.avgCosts.waste),
      maintenance: this.compareWithAverage(userCosts.maintenance, cityInfo.avgCosts.maintenance),
      total: this.compareWithAverage(userCosts.total, 
        cityInfo.avgCosts.heating + cityInfo.avgCosts.water + 
        cityInfo.avgCosts.waste + cityInfo.avgCosts.maintenance)
    };

    // Calculate potential savings
    const savings = this.calculateSavings(userCosts, cityInfo.avgCosts, billData.apartmentSize, language);

    // Determine confidence based on data quality
    const confidence = this.calculateConfidence(cityInfo, billData);

    return {
      userCosts,
      regionalAverages: {
        heating: cityInfo.avgCosts.heating,
        water: cityInfo.avgCosts.water,
        waste: cityInfo.avgCosts.waste,
        maintenance: cityInfo.avgCosts.maintenance,
        total: cityInfo.avgCosts.heating + cityInfo.avgCosts.water + 
               cityInfo.avgCosts.waste + cityInfo.avgCosts.maintenance
      },
      comparisons,
      savings,
      cityInfo,
      energyData,
      confidence
    };
  }

  private calculateMonthsInPeriod(period: { start: string; end: string }): number {
    const start = new Date(period.start);
    const end = new Date(period.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.round(diffDays / 30.44)); // Average days per month
  }

  private compareWithAverage(userCost: number, average: number): ComparisonResult {
    const percentage = ((userCost - average) / average) * 100;
    
    let status: ComparisonResult['status'];
    let message: string;

    if (percentage < -15) {
      status = 'low';
      message = `${Math.abs(percentage).toFixed(0)}% unter dem Durchschnitt - sehr gut!`;
    } else if (percentage < 15) {
      status = 'average';
      message = `Im Durchschnittsbereich (${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%)`;
    } else if (percentage < 50) {
      status = 'high';
      message = `${percentage.toFixed(0)}% über dem Durchschnitt - prüfenswert`;
    } else {
      status = 'very_high';
      message = `${percentage.toFixed(0)}% über dem Durchschnitt - deutlich zu hoch!`;
    }

    return { percentage, status, message };
  }

  private calculateSavings(
    userCosts: AnalysisResult['userCosts'], 
    avgCosts: GermanCity['avgCosts'],
    apartmentSize: number,
    language: Language = 'de'
  ): { potential: number; recommendations: string[] } {
    let potentialAnnualSavings = 0;
    const recommendations: string[] = [];
    const t = getTranslations(language);

    // Heating savings
    if (userCosts.heating > avgCosts.heating * 1.2) {
      const heatingSavings = (userCosts.heating - avgCosts.heating) * apartmentSize * 12;
      potentialAnnualSavings += heatingSavings;
      recommendations.push(
        `Heizkosten: Bis zu €${heatingSavings.toFixed(0)}/Jahr sparen durch bessere Dämmung oder Heizungsoptimierung`
      );
    }

    // Water savings
    if (userCosts.water > avgCosts.water * 1.3) {
      const waterSavings = (userCosts.water - avgCosts.water) * apartmentSize * 12;
      potentialAnnualSavings += waterSavings;
      recommendations.push(
        `Wasserkosten: Bis zu €${waterSavings.toFixed(0)}/Jahr sparen durch Wassersparmaßnahmen`
      );
    }

    // Maintenance savings
    if (userCosts.maintenance > avgCosts.maintenance * 1.5) {
      const maintenanceSavings = (userCosts.maintenance - avgCosts.maintenance) * apartmentSize * 12;
      potentialAnnualSavings += maintenanceSavings;
      recommendations.push(
        `Instandhaltung: €${maintenanceSavings.toFixed(0)}/Jahr möglicherweise zu hoch - Vermieter kontaktieren`
      );
    }

    // General recommendations
    if (potentialAnnualSavings > 200) {
      recommendations.push(t.recommendTalkToLandlord);
      recommendations.push(t.recommendDetailedBreakdown);
    }

    if (potentialAnnualSavings > 500) {
      recommendations.push(t.recommendTenantAssociation);
    }

    return {
      potential: potentialAnnualSavings,
      recommendations
    };
  }

  private calculateConfidence(cityInfo: GermanCity, billData: BillData): number {
    let confidence = 100;

    // Reduce confidence for estimated data
    if (cityInfo.dataSource.includes('Estimated')) {
      confidence -= 25;
    }

    // Reduce confidence for very small cities
    if (cityInfo.population < 50000) {
      confidence -= 15;
    }

    // Reduce confidence for incomplete bill data
    if (!billData.costs.heating || !billData.apartmentSize) {
      confidence -= 20;
    }

    // Increase confidence for major cities with direct API data
    if (cityInfo.population > 500000 && !cityInfo.dataSource.includes('Estimated')) {
      confidence += 10;
    }

    return Math.max(50, Math.min(100, confidence));
  }

  // OCR text processing for German utility bills
  async extractBillData(ocrText: string): Promise<Partial<BillData>> {
    const billData: Partial<BillData> = {};

    // Use improved PLZ extraction
    const plzCandidates = OCRPreprocessor.extractPLZPatterns(ocrText);
    if (plzCandidates.length > 0) {
      billData.plz = plzCandidates[0];
    }

    // Use improved apartment size extraction
    const apartmentSize = OCRPreprocessor.extractApartmentSize(ocrText);
    if (apartmentSize) {
      billData.apartmentSize = apartmentSize;
    }

    // Extract period (German date format)
    const periodMatch = ocrText.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*-\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (periodMatch) {
      billData.period = {
        start: `${periodMatch[3]}-${periodMatch[2].padStart(2, '0')}-${periodMatch[1].padStart(2, '0')}`,
        end: `${periodMatch[6]}-${periodMatch[5].padStart(2, '0')}-${periodMatch[4].padStart(2, '0')}`
      };
    }

    // Extract costs (German number format with comma)
    billData.costs = {
      heating: this.extractCost(ocrText, ['heizung', 'heizkosten', 'warmwasser']),
      water: this.extractCost(ocrText, ['wasser', 'kaltwasser', 'wasserkosten']),
      waste: this.extractCost(ocrText, ['müll', 'abfall', 'entsorgung', 'müllabfuhr']),
      maintenance: this.extractCost(ocrText, ['instandhaltung', 'reparatur', 'wartung']),
      electricity: this.extractCost(ocrText, ['strom', 'elektrizität', 'stromkosten']),
      other: 0
    };

    // Extract total amount
    const totalMatch = ocrText.match(/gesamt[:\s]*(\d+(?:,\d{2})?)\s*€/i);
    if (totalMatch) {
      billData.totalAmount = parseFloat(totalMatch[1].replace(',', '.'));
    }

    return billData;
  }

  private extractCost(text: string, keywords: string[]): number {
    for (const keyword of keywords) {
      // Look for pattern: keyword followed by amount in euros
      const regex = new RegExp(`${keyword}[^\\d]*?(\\d+(?:,\\d{2})?)\\s*€`, 'i');
      const match = text.match(regex);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }
    return 0;
  }
}

export const billAnalyzer = new NebenkostenAnalyzer();