'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { AnalysisResult } from '@/lib/bill-analyzer';
import { useLanguage } from '@/contexts/LanguageContext';
import jsPDF from 'jspdf';

interface PDFExportProps {
  result: AnalysisResult;
}

export default function PDFExport({ result }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { t, language } = useLanguage();

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(37, 99, 235); // Blue
      pdf.text(language === 'de' ? 'NebenKosten-Checker Analyse' : 'UtilityCost-Checker Analysis', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${language === 'de' ? 'Erstellt am' : 'Generated on'}: ${new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}`, 20, yPosition);
      
      yPosition += 20;

      // Property Information
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(language === 'de' ? 'Immobilien-Information' : 'Property Information', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.text(`${language === 'de' ? 'Standort' : 'Location'}: ${result.cityInfo.city}, ${result.cityInfo.state}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`${language === 'de' ? 'Postleitzahl' : 'Postal Code'}: ${result.cityInfo.plz}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`${language === 'de' ? 'Versorger' : 'Utility Provider'}: ${result.cityInfo.utilityProvider}`, 20, yPosition);
      
      yPosition += 20;

      // Cost Comparison Table
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(language === 'de' ? 'Kostenvergleich (€/m²/Monat)' : 'Cost Comparison (€/m²/month)', 20, yPosition);
      
      yPosition += 15;

      // Table headers
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const headers = language === 'de' 
        ? ['Kategorie', 'Ihre Kosten', 'Durchschnitt', 'Differenz', 'Status']
        : ['Category', 'Your Costs', 'Average', 'Difference', 'Status'];
      
      const colWidths = [40, 30, 30, 30, 40];
      let xPos = 20;
      
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPosition);
        xPos += colWidths[i];
      });
      
      yPosition += 8;

      // Table rows
      const categories = [
        { key: 'heating', icon: '🔥', name: language === 'de' ? 'Heizung' : 'Heating' },
        { key: 'water', icon: '💧', name: language === 'de' ? 'Wasser' : 'Water' },
        { key: 'waste', icon: '🗑️', name: language === 'de' ? 'Müll' : 'Waste' },
        { key: 'maintenance', icon: '🔧', name: language === 'de' ? 'Wartung' : 'Maintenance' }
      ];

      categories.forEach(category => {
        const userCost = result.userCosts[category.key as keyof typeof result.userCosts];
        const avgCost = result.regionalAverages[category.key as keyof typeof result.regionalAverages];
        const comparison = result.comparisons[category.key as keyof typeof result.comparisons];
        
        xPos = 20;
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        
        pdf.text(`${category.icon} ${category.name}`, xPos, yPosition);
        xPos += colWidths[0];
        
        pdf.text(`€${userCost.toFixed(2)}`, xPos, yPosition);
        xPos += colWidths[1];
        
        pdf.text(`€${avgCost.toFixed(2)}`, xPos, yPosition);
        xPos += colWidths[2];
        
        const diff = userCost - avgCost;
        pdf.setTextColor(diff > 0 ? 220 : 34, diff > 0 ? 38 : 197, diff > 0 ? 38 : 94);
        pdf.text(`${diff > 0 ? '+' : ''}€${diff.toFixed(2)}`, xPos, yPosition);
        xPos += colWidths[3];
        
        // Status
        const statusColor = comparison.status === 'low' ? [34, 197, 94] : 
                           comparison.status === 'high' ? [220, 38, 38] : [251, 191, 36];
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        const statusText = comparison.status === 'low' ? (language === 'de' ? 'Niedrig' : 'Low') :
                          comparison.status === 'high' ? (language === 'de' ? 'Hoch' : 'High') :
                          (language === 'de' ? 'Normal' : 'Average');
        pdf.text(statusText, xPos, yPosition);
        
        yPosition += 8;
      });

      yPosition += 15;

      // Total Summary
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(language === 'de' ? 'Gesamtübersicht' : 'Total Summary', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(11);
      
      const totalDiff = result.userCosts.total - result.regionalAverages.total;
      pdf.text(`${language === 'de' ? 'Ihre Gesamtkosten' : 'Your Total Costs'}: €${result.userCosts.total.toFixed(2)}/m²/month`, 20, yPosition);
      yPosition += 6;
      pdf.text(`${language === 'de' ? 'Regional Durchschnitt' : 'Regional Average'}: €${result.regionalAverages.total.toFixed(2)}/m²/month`, 20, yPosition);
      yPosition += 6;
      
             pdf.setTextColor(totalDiff > 0 ? 220 : 34, totalDiff > 0 ? 38 : 197, totalDiff > 0 ? 38 : 94);
      pdf.text(`${language === 'de' ? 'Differenz' : 'Difference'}: ${totalDiff > 0 ? '+' : ''}€${totalDiff.toFixed(2)}/m²/month`, 20, yPosition);
      
      yPosition += 15;

      // Savings Information
      if (result.savings.potential > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(34, 197, 94);
        pdf.text(language === 'de' ? 'Einsparpotential' : 'Savings Potential', 20, yPosition);
        
        yPosition += 10;
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${language === 'de' ? 'Jährliches Einsparpotential' : 'Annual Savings Potential'}: €${result.savings.potential.toFixed(2)}`, 20, yPosition);
        yPosition += 6;
        
        // Add recommendations
        result.savings.recommendations.forEach((recommendation, index) => {
          pdf.text(`• ${recommendation}`, 20, yPosition, { maxWidth: pageWidth - 40 });
          yPosition += 6;
        });
        
        yPosition += 20;
      }

      // Energy Data
      if (result.energyData) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(language === 'de' ? 'Aktuelle Energiedaten' : 'Current Energy Data', 20, yPosition);
        
        yPosition += 10;
        pdf.setFontSize(9);
        pdf.text(`${language === 'de' ? 'Strompreis' : 'Electricity Price'}: €${result.energyData.rates.electricity.toFixed(4)}/kWh`, 20, yPosition);
        yPosition += 5;
        pdf.text(`${language === 'de' ? 'Gaspreis' : 'Gas Price'}: €${result.energyData.rates.gas.toFixed(4)}/kWh`, 20, yPosition);
        yPosition += 5;
        pdf.text(`${language === 'de' ? 'CO₂-Fußabdruck' : 'CO₂ Footprint'}: ${result.energyData.co2Footprint.toFixed(0)}g/kWh`, 20, yPosition);
        yPosition += 5;
        pdf.text(`${language === 'de' ? 'Datenstand' : 'Data Date'}: ${result.energyData.rates.timestamp.split('T')[0]}`, 20, yPosition);
        
        yPosition += 15;
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${language === 'de' ? 'Generiert von' : 'Generated by'} NebenKosten-Checker | ${language === 'de' ? 'Basiert auf offiziellen deutschen Datenquellen' : 'Based on official German data sources'}`, 20, pageHeight - 20);
      pdf.text(`${language === 'de' ? 'Datenquellen' : 'Data Sources'}: SMARD (Bundesnetzagentur), Corrently API, Fraunhofer Institute, Mieterbund`, 20, pageHeight - 15);
      pdf.text(`${language === 'de' ? 'Vertrauenswürdigkeit' : 'Confidence'}: ${result.confidence}% | ${language === 'de' ? 'DSGVO-konform' : 'GDPR Compliant'}`, 20, pageHeight - 10);

      // Generate and download
      const fileName = `nebenkosten-analyse-${result.cityInfo.plz}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(language === 'de' ? 'PDF-Export fehlgeschlagen' : 'PDF export failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{language === 'de' ? 'Generiere PDF...' : 'Generating PDF...'}</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>{language === 'de' ? 'PDF Export' : 'Export PDF'}</span>
        </>
      )}
    </button>
  );
}