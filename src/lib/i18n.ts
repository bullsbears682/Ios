export type Language = 'de' | 'en';

export interface Translations {
  // Navigation & Header
  title: string;
  subtitle: string;
  languageSwitch: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroManualTitle: string;
  heroManualDescription: string;
  
  // Features
  featuresTitle: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  
  // Upload Section
  uploadTitle: string;
  uploadDescription: string;
  uploadButton: string;
  uploadDrop: string;
  uploadFormats: string;
  
  // Analysis Steps
  stepUploading: string;
  stepProcessing: string;
  stepExtracting: string;
  stepAnalyzing: string;
  stepComparing: string;
  stepCompleted: string;
  
  // Results
  resultsTitle: string;
  summaryTitle: string;
  summaryYourCosts: string;
  summaryRegionalAvg: string;
  summaryDifference: string;
  summaryStatus: string;
  
  // Cost Categories
  heating: string;
  water: string;
  waste: string;
  maintenance: string;
  
  // Status Messages
  statusMuchHigher: string;
  statusHigher: string;
  statusNormal: string;
  statusLower: string;
  statusMuchLower: string;
  
  // Recommendations
  recommendationsTitle: string;
  potentialSavings: string;
  
  // Energy Data
  energyDataTitle: string;
  currentElectricityPrice: string;
  currentGasPrice: string;
  co2Footprint: string;
  
  // Actions
  downloadReport: string;
  newAnalysis: string;
  
  // Demo Page
  demoTitle: string;
  demoDescription: string;
  selectCity: string;
  enterPLZ: string;
  
  // Trust Indicators
  dataSourcesTitle: string;
  gdprCompliant: string;
  
  // Errors
  errorFileSize: string;
  errorFileType: string;
  errorPLZNotFound: string;
  errorApartmentSize: string;
  errorAnalysisFailed: string;
  
  // Units
  euroPerMonth: string;
  euroPerSqm: string;
  percentSavings: string;
  
  // Footer
  footerText: string;
  
  // Additional UI Elements
  backToMain: string;
  dataQuality: string;
  congratulations: string;
  fairCosts: string;
  supportedDocuments: string;
  forAllGermanCities: string;
  loadingData: string;
  currentEnergyData: string;
  exportAnalysis: string;
  
  // Recommendations
  recommendTalkToLandlord: string;
  recommendDetailedBreakdown: string;
  recommendTenantAssociation: string;
  
  // Demo specific
  states: string;
  citiesAndMunicipalities: string;
  completeGermanyCoverage: string;
  
  // Additional phrases
  furtherActions: string;
  co2Intensity: string;
  costsInNormalRange: string;
  
  // Demo page extended
  demoSubtitle: string;
  demoCoverage: string;
  
  // Manual input
  manualDataEntry: string;
  enterDataManually: string;
  manualInputDescription: string;
  addressInformation: string;
  monthlyCosting: string;
  billingPeriod: string;
  startDate: string;
  endDate: string;
  analyzeCosts: string;
  cancel: string;
  tipsTitle: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
}

export const translations: Record<Language, Translations> = {
  de: {
    // Navigation & Header
    title: "NebenKosten-Checker",
    subtitle: "Transparente Nebenkostenanalyse mit echten APIs",
    languageSwitch: "English",
    
    // Hero Section
    heroTitle: "Sind Ihre Nebenkosten zu hoch?",
    heroSubtitle: "Finden Sie es in 2 Minuten heraus",
    heroDescription: "Geben Sie Ihre Nebenkostendaten ein und vergleichen Sie sofort mit aktuellen Durchschnittskosten aus ganz Deutschland. Optional: Scannen Sie Ihre Rechnung zum automatischen Ausfüllen.",
    heroManualTitle: "Prüfen Sie Ihre Nebenkosten in 2 Minuten",
    heroManualDescription: "Geben Sie Ihre Nebenkostendaten ein und vergleichen Sie sofort mit aktuellen Durchschnittskosten aus ganz Deutschland. Optional: Scannen Sie Ihre Rechnung zum automatischen Ausfüllen.",
    
    // Features
    featuresTitle: "Warum NebenKosten-Checker?",
    feature1Title: "Einfache Eingabe",
    feature1Description: "Schnelle manuelle Eingabe mit optionaler KI-Scan-Unterstützung für maximale Genauigkeit",
    feature2Title: "Offizielle Statistiken + Live-APIs",
    feature2Description: "Echte Strompreise (Awattar) + offizielle Betriebskostenspiegel-Daten",
    feature3Title: "DSGVO-konform",
    feature3Description: "Ihre Daten bleiben privat und werden nicht gespeichert",
    
    // Upload Section
    uploadTitle: "Nebenkostenabrechnung hochladen",
    uploadDescription: "Unterstützte Formate: PDF, JPG, PNG. Maximale Dateigröße: 10MB",
    uploadButton: "Datei auswählen",
    uploadDrop: "Datei hier ablegen oder klicken zum Auswählen",
    uploadFormats: "PDF, JPG, PNG bis 10MB",
    
    // Analysis Steps
    stepUploading: "Datei wird hochgeladen...",
    stepProcessing: "Dokument wird verarbeitet...",
    stepExtracting: "Daten werden extrahiert...",
    stepAnalyzing: "Kosten werden analysiert...",
    stepComparing: "Vergleich mit regionalen Durchschnittskosten...",
    stepCompleted: "Analyse abgeschlossen!",
    
    // Results
    resultsTitle: "Ihre Nebenkostenanalyse",
    summaryTitle: "Zusammenfassung",
    summaryYourCosts: "Ihre Kosten",
    summaryRegionalAvg: "Regionaler Durchschnitt",
    summaryDifference: "Unterschied",
    summaryStatus: "Status",
    
    // Cost Categories
    heating: "Heizung",
    water: "Wasser",
    waste: "Müll",
    maintenance: "Instandhaltung",
    
    // Status Messages
    statusMuchHigher: "Deutlich zu hoch",
    statusHigher: "Etwas zu hoch", 
    statusNormal: "Normal",
    statusLower: "Günstig",
    statusMuchLower: "Sehr günstig",
    
    // Recommendations
    recommendationsTitle: "Empfehlungen",
    potentialSavings: "Mögliche Einsparungen",
    
    // Energy Data
    energyDataTitle: "Aktuelle Energiedaten für Ihre Stadt",
    currentElectricityPrice: "Aktueller Strompreis",
    currentGasPrice: "Aktueller Gaspreis",
    co2Footprint: "CO₂-Fußabdruck",
    
    // Actions
    downloadReport: "Bericht herunterladen",
    newAnalysis: "Neue Analyse starten",
    
    // Demo Page
    demoTitle: "Demo: Deutschlandweite Abdeckung",
    demoDescription: "Testen Sie unsere Live-API-Integration mit aktuellen 2025-Daten",
    selectCity: "Stadt auswählen",
    enterPLZ: "PLZ eingeben",
    
    // Trust Indicators
    dataSourcesTitle: "Vertrauenswürdige Datenquellen",
    gdprCompliant: "DSGVO-konform",
    
    // Errors
    errorFileSize: "Datei zu groß (max. 10MB)",
    errorFileType: "Ungültiger Dateityp",
    errorPLZNotFound: "Postleitzahl konnte nicht erkannt werden",
    errorApartmentSize: "Wohnungsgröße konnte nicht erkannt werden",
    errorAnalysisFailed: "Analyse fehlgeschlagen",
    
    // Units
    euroPerMonth: "€/Monat",
    euroPerSqm: "€/m²",
    percentSavings: "% Einsparung",
    
    // Footer
    footerText: "© 2025 NebenKosten-Checker. Alle Rechte vorbehalten.",
    
    // Additional UI Elements
    backToMain: "← Zurück zur Hauptanwendung",
    dataQuality: "Datenqualität",
    congratulations: "Glückwunsch! 🎉",
    fairCosts: "Faire Kosten",
    supportedDocuments: "Unterstützte Dokumente:",
    forAllGermanCities: "🇩🇪 Für alle deutschen Städte",
    loadingData: "Lade aktuelle Daten für PLZ",
    currentEnergyData: "Aktuelle Energiedaten für",
    exportAnalysis: "Exportieren Sie Ihre Analyse oder starten Sie eine neue Prüfung",
    
    // Recommendations
    recommendTalkToLandlord: "Sprechen Sie mit Ihrem Vermieter über die überdurchschnittlichen Kosten",
    recommendDetailedBreakdown: "Fordern Sie eine detaillierte Aufschlüsselung der Betriebskosten an",
    recommendTenantAssociation: "Erwägen Sie eine Beratung durch den Deutschen Mieterbund",
    
    // Demo specific
    states: "Bundesländer",
    citiesAndMunicipalities: "Städte & Gemeinden",
    completeGermanyCoverage: "🎯 Vollständige Deutschland-Abdeckung:",
    
    // Additional phrases
    furtherActions: "Weitere Aktionen",
    co2Intensity: "🌱 CO₂-Intensität",
    costsInNormalRange: "Ihre Nebenkosten liegen im normalen Bereich. Keine Auffälligkeiten erkannt.",
    
    // Demo page extended
    demoSubtitle: "Echte 2025 API-Daten für jede deutsche Postleitzahl",
    demoCoverage: "Jede deutsche Postleitzahl wird unterstützt mit echten 2025 Energiepreisen und regionalen Durchschnittskosten von offiziellen Quellen.",
    
    // Manual input
    manualDataEntry: "Manuelle Dateneingabe",
    enterDataManually: "Daten manuell eingeben",
    manualInputDescription: "Bitte geben Sie Ihre Nebenkostendaten manuell ein",
    addressInformation: "Adressinformationen",
    monthlyCosting: "Monatliche Kosten (€)",
    billingPeriod: "Abrechnungszeitraum",
    startDate: "Startdatum",
    endDate: "Enddatum",
    analyzeCosts: "Kosten analysieren",
    cancel: "Abbrechen",
    tipsTitle: "💡 Tipps für eine genaue Analyse:",
    tip1: "• Geben Sie Kosten pro m²/Monat ein (€/m²/Monat)",
    tip2: "• Bei Gesamtkosten: Teilen Sie durch Wohnungsgröße",
    tip3: "• Bei Jahreskosten: Erst durch 12 Monate teilen",
    tip4: "• Nutzen Sie den Kostenrechner für automatische Umrechnung"
  },
  
  en: {
    // Navigation & Header
    title: "UtilityCost-Checker",
    subtitle: "Transparent German Utility Analysis with Real APIs",
    languageSwitch: "Deutsch",
    
    // Hero Section
    heroTitle: "Are Your German Utility Bills Too High?",
    heroSubtitle: "Find Out in 2 Minutes",
    heroDescription: "Enter your utility bill data and instantly compare with current average costs from across Germany. Optional: Scan your bill to auto-fill fields. Perfect for expats and international residents.",
    heroManualTitle: "Check Your German Utility Costs in 2 Minutes",
    heroManualDescription: "Enter your utility bill data and instantly compare with current average costs from across Germany. Optional: Scan your bill to auto-fill fields. Perfect for expats and international residents.",
    
    // Features
    featuresTitle: "Why UtilityCost-Checker?",
    feature1Title: "Easy Input",
    feature1Description: "Quick manual entry with optional AI scan assistance for maximum accuracy",
    feature2Title: "Official Statistics + Live APIs",
    feature2Description: "Real electricity prices (Awattar) + official Betriebskostenspiegel data",
    feature3Title: "GDPR Compliant",
    feature3Description: "Your data stays private and is not stored - perfect for international residents",
    
    // Upload Section
    uploadTitle: "Upload German Utility Bill",
    uploadDescription: "Supported formats: PDF, JPG, PNG. Maximum file size: 10MB. Works with all German utility companies.",
    uploadButton: "Select File",
    uploadDrop: "Drop your Nebenkostenabrechnung here or click to select",
    uploadFormats: "PDF, JPG, PNG up to 10MB",
    
    // Analysis Steps
    stepUploading: "Uploading file...",
    stepProcessing: "Processing German document...",
    stepExtracting: "Extracting cost data...",
    stepAnalyzing: "Analyzing utility costs...",
    stepComparing: "Comparing with German regional averages...",
    stepCompleted: "Analysis completed!",
    
    // Results
    resultsTitle: "Your German Utility Cost Analysis",
    summaryTitle: "Summary",
    summaryYourCosts: "Your Costs",
    summaryRegionalAvg: "German Regional Average",
    summaryDifference: "Difference",
    summaryStatus: "Status",
    
    // Cost Categories
    heating: "Heating (Heizung)",
    water: "Water (Wasser)",
    waste: "Waste (Müll)",
    maintenance: "Maintenance (Instandhaltung)",
    
    // Status Messages
    statusMuchHigher: "Much too high - negotiate with landlord",
    statusHigher: "Above average - room for improvement",
    statusNormal: "Normal for German standards",
    statusLower: "Good value - below average",
    statusMuchLower: "Excellent value - very competitive",
    
    // Recommendations
    recommendationsTitle: "Recommendations for Expats",
    potentialSavings: "Annual Savings Potential",
    
    // Energy Data
    energyDataTitle: "Current German Energy Data for Your City",
    currentElectricityPrice: "Current Electricity Price",
    currentGasPrice: "Current Gas Price",
    co2Footprint: "CO₂ Footprint",
    
    // Actions
    downloadReport: "Download English Report",
    newAnalysis: "Analyze Another Bill",
    
    // Demo Page
    demoTitle: "Demo: Complete Germany Coverage",
    demoDescription: "Test our live API integration with current 2025 data from all German cities",
    selectCity: "Select German City",
    enterPLZ: "Enter German Postal Code (PLZ)",
    
    // Trust Indicators
    dataSourcesTitle: "Official German Data Sources",
    gdprCompliant: "GDPR Compliant & Expat-Friendly",
    
    // Errors
    errorFileSize: "File too large (max 10MB)",
    errorFileType: "Invalid file type - please upload PDF, JPG, or PNG",
    errorPLZNotFound: "German postal code (PLZ) could not be detected in document",
    errorApartmentSize: "Apartment size (m²) could not be detected in document",
    errorAnalysisFailed: "Analysis failed - please try again",
    
    // Units
    euroPerMonth: "€/month",
    euroPerSqm: "€/m²",
    percentSavings: "% potential savings",
    
    // Footer
    footerText: "© 2025 UtilityCost-Checker. Helping expats understand German utility costs.",
    
    // Additional UI Elements
    backToMain: "← Back to Main Application",
    dataQuality: "Data Quality",
    congratulations: "Congratulations! 🎉",
    fairCosts: "Fair Costs",
    supportedDocuments: "Supported Documents:",
    forAllGermanCities: "🇩🇪 For all German cities",
    loadingData: "Loading current data for postal code",
    currentEnergyData: "Current Energy Data for",
    exportAnalysis: "Export your analysis or start a new check",
    
    // Recommendations
    recommendTalkToLandlord: "Discuss above-average costs with your landlord",
    recommendDetailedBreakdown: "Request a detailed breakdown of operating costs",
    recommendTenantAssociation: "Consider consulting the German Tenants' Association (Mieterbund)",
    
    // Demo specific
    states: "Federal States",
    citiesAndMunicipalities: "Cities & Municipalities", 
    completeGermanyCoverage: "🎯 Complete Germany Coverage:",
    
    // Additional phrases
    furtherActions: "Further Actions",
    co2Intensity: "🌱 CO₂ Intensity",
    costsInNormalRange: "Your utility costs are within normal range. No issues detected.",
    
    // Demo page extended
    demoSubtitle: "Real 2025 API data for every German postal code",
    demoCoverage: "Every German postal code is supported with real 2025 energy prices and regional average costs from official sources.",
    
    // Manual input
    manualDataEntry: "Manual Data Entry",
    enterDataManually: "Enter Data Manually",
    manualInputDescription: "Please enter your utility bill information manually",
    addressInformation: "Address Information",
    monthlyCosting: "Monthly Costs (€)",
    billingPeriod: "Billing Period",
    startDate: "Start Date",
    endDate: "End Date",
    analyzeCosts: "Analyze Costs",
    cancel: "Cancel",
    tipsTitle: "💡 Tips for accurate analysis:",
    tip1: "• Enter costs per m²/month (€/m²/month)",
    tip2: "• For total costs: Divide by apartment size",
    tip3: "• For yearly costs: Divide by 12 months first",
    tip4: "• Use the cost calculator for automatic conversion"
  }
};

export function getTranslations(language: Language): Translations {
  return translations[language];
}

export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'de';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('de')) return 'de';
  return 'en'; // Default to English for international users
}

export default translations;