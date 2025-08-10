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
}

export const translations: Record<Language, Translations> = {
  de: {
    // Navigation & Header
    title: "NebenKosten-Checker",
    subtitle: "Intelligente Nebenkostenanalyse für Deutschland",
    languageSwitch: "English",
    
    // Hero Section
    heroTitle: "Sind Ihre Nebenkosten zu hoch?",
    heroSubtitle: "Finden Sie es in 30 Sekunden heraus",
    heroDescription: "Laden Sie Ihre Nebenkostenabrechnung hoch und vergleichen Sie automatisch mit aktuellen Durchschnittswerten aus ganz Deutschland. Basierend auf offiziellen 2025-Daten.",
    
    // Features
    featuresTitle: "Warum NebenKosten-Checker?",
    feature1Title: "Automatische Analyse",
    feature1Description: "KI-gestützte Texterkennung analysiert Ihre Abrechnung in Sekunden",
    feature2Title: "Aktuelle 2025-Daten",
    feature2Description: "Vergleich mit Live-Daten aus allen deutschen Städten und Regionen",
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
    footerText: "© 2025 NebenKosten-Checker. Alle Rechte vorbehalten."
  },
  
  en: {
    // Navigation & Header
    title: "UtilityCost-Checker",
    subtitle: "Smart Utility Bill Analysis for Germany",
    languageSwitch: "Deutsch",
    
    // Hero Section
    heroTitle: "Are Your German Utility Bills Too High?",
    heroSubtitle: "Find Out in 30 Seconds",
    heroDescription: "Upload your German utility bill (Nebenkostenabrechnung) and automatically compare with current average costs from across Germany. Perfect for expats and international residents. Based on official 2025 data.",
    
    // Features
    featuresTitle: "Why UtilityCost-Checker?",
    feature1Title: "Automatic Analysis",
    feature1Description: "AI-powered German text recognition analyzes your Nebenkostenabrechnung in seconds",
    feature2Title: "Current 2025 Data",
    feature2Description: "Compare with live data from all German cities and regions using official APIs",
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
    footerText: "© 2025 UtilityCost-Checker. Helping expats understand German utility costs."
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