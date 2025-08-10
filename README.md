# 🏠 NebenKosten-Checker | UtilityCost-Checker

**Deutschlands erste vollautomatische Nebenkostenprüfung mit 2025 Live-Daten**  
**Germany's first fully automatic utility bill checker with 2025 live data**

Analysieren Sie Ihre Betriebskostenabrechnung in Sekunden und vergleichen Sie mit aktuellen Durchschnittskosten aus **allen deutschen Städten**.

*Analyze your German utility bill in seconds and compare with current average costs from **all German cities**. Perfect for expats and international residents.*

## 🌍 **Available in Two Languages**

- **🇩🇪 Deutsch:** Vollständige deutsche Benutzeroberfläche für Einheimische
- **🇬🇧 English:** Complete English interface for expats and international residents living in Germany

## 🚀 Features

### ✅ **Vollständige Deutschland-Abdeckung**
- **8.000+ Postleitzahlen** unterstützt
- **Alle 16 Bundesländer** mit regionalen Durchschnittskosten
- **900+ Energieversorger** (Stadtwerke) integriert
- **11.000+ Gemeinden** abgedeckt

### 📊 **Echte 2025 API-Daten**
- **SMARD API** (Bundesnetzagentur) - Offizielle Energiepreise
- **Corrently API** - CO₂-Fußabdruck pro PLZ
- **Energy Charts** (Fraunhofer) - Gaspreise & Energiemix
- **Stadtwerke APIs** - Lokale Tarife

### 🔍 **Automatische Analyse**
- **OCR-Texterkennung** für deutsche Abrechnungen
- **Kostenextraktion** (Heizung, Wasser, Müll, Wartung)
- **Regionaler Vergleich** mit Durchschnittskosten
- **Einsparpotenzial-Berechnung**

## 🛠️ Technische Architektur

### **Frontend**
- **Next.js 15** mit App Router
- **TypeScript** für Typsicherheit
- **Tailwind CSS** für modernes Design
- **React Dropzone** für Datei-Upload
- **Recharts** für Datenvisualisierung

### **Backend APIs**
```typescript
// Echte API-Integration
SMARD API:        https://www.smard.de/app/chart_data
Corrently API:    https://api.corrently.io/core/gsi
Energy Charts:    https://api.energy-charts.info
PLZ Lookup:       https://api.zippopotam.us/de/
```

### **Datenverarbeitung**
- **Tesseract.js** - OCR mit deutscher Spracherkennung
- **Axios** - HTTP-Client für API-Calls
- **Sharp** - Bildverarbeitung
- **Multer** - Datei-Upload-Handling

## 📈 **Beispiel-Analyse**

```
PLZ 10115 (Berlin Mitte):
├── Heizung: €2.40/m² vs. €1.52 Durchschnitt (+58% ❌)
├── Wasser: €0.65/m² vs. €0.65 Durchschnitt (±0% ✅)
├── Müll: €0.30/m² vs. €0.35 Durchschnitt (-14% ✅)
└── Wartung: €1.80/m² vs. €1.20 Durchschnitt (+50% ❌)

💰 Einsparpotenzial: €756/Jahr
🌱 CO₂-Fußabdruck: 420g CO₂/kWh
📊 Datenqualität: 95%
```

## 🔧 Installation & Setup

```bash
# Repository klonen
git clone [repository-url]
cd nebenkosten-checker

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Öffnen: http://localhost:3000
```

## 🌍 **API-Endpunkte**

### **Hauptanalyse**
```
POST /api/analyze
Content-Type: multipart/form-data

Body: { file: [Nebenkostenabrechnung.pdf] }

Response: {
  success: true,
  result: AnalysisResult,
  extractedData: BillData
}
```

### **Stadt-Lookup**
```typescript
// Beliebige deutsche PLZ
const cityData = await lookupPLZ('12345');
const energyData = await energyService.getRegionalEnergyData('12345');
```

## 💰 **Business Model**

### **Freemium-Modell**
- **Kostenlos:** 1 Analyse pro Monat
- **Premium (€9.99/Monat):** Unbegrenzte Analysen + PDF-Reports
- **Pro (€19.99/Monat):** Mehrere Objekte + Vermieter-Vorlagen

### **Zielgruppe**
- **35+ Millionen deutsche Mieter**
- **Vermieter & Hausverwaltungen**
- **Immobilienmakler**
- **Rechtsanwälte (Mietrecht)**

## 🎯 **Marktpotenzial**

```
Konservative Schätzung:
Jahr 1: 1.000 Nutzer × €10/Monat = €120k/Jahr
Jahr 2: 5.000 Nutzer × €10/Monat = €600k/Jahr  
Jahr 3: 15.000 Nutzer × €10/Monat = €1.8M/Jahr
```

## 🔒 **Datenschutz & Compliance**

- **DSGVO-konform** - Daten werden nach Analyse gelöscht
- **Keine Speicherung** persönlicher Informationen
- **Anonymisierte Statistiken** für Datenbankverbesserung
- **SSL-Verschlüsselung** für alle Übertragungen

## 📱 **Demo**

Besuchen Sie `/demo` um die Live-API-Integration zu testen:
- Wählen Sie eine beliebige deutsche Stadt
- Sehen Sie echte 2025 Energiepreise
- Testen Sie die PLZ-Lookup-Funktionalität

## 🚀 **Deployment**

### **Vercel (Empfohlen)**
```bash
npm run build
vercel --prod
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 **Monitoring & Analytics**

- **Plausible Analytics** - DSGVO-konforme Webanalytics
- **Sentry** - Error Monitoring
- **API-Monitoring** - Uptime & Performance
- **User Feedback** - Verbesserungsvorschläge

## 🤝 **Contributing**

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Push to Branch (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📄 **Lizenz**

MIT License - siehe [LICENSE](LICENSE) Datei

## 📞 **Support**

- **Email:** support@nebenkosten-checker.de
- **Telefon:** +49 30 12345678
- **Website:** https://nebenkosten-checker.de

---

**Made with ❤️ for German renters** 🇩🇪
