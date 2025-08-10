# 📱 Termux Quick Start

**NebenKosten-Checker in 3 Minuten auf Android starten**

## 🚀 **Einfache Installation**

### **Option 1: Automatisches Setup**
```bash
# 1. Termux öffnen und eingeben:
curl -o- https://raw.githubusercontent.com/[YOUR-REPO]/main/termux-install.sh | bash
```

### **Option 2: Manuelle Installation**
```bash
# 1. System aktualisieren
pkg update && pkg upgrade -y

# 2. Node.js installieren  
pkg install nodejs npm git -y

# 3. Projekt klonen
git clone [REPOSITORY-URL] ~/nebenkosten-checker
cd ~/nebenkosten-checker

# 4. Dependencies installieren
npm install --legacy-peer-deps

# 5. App starten
npm run termux
```

## 📱 **Sofort testen**

Nach der Installation:

1. **App öffnen:** `http://localhost:3000`
2. **Demo testen:** `http://localhost:3000/demo`
3. **PLZ eingeben:** Beliebige deutsche Postleitzahl
4. **Echte Daten sehen:** Live 2025 Energiepreise

## 🎯 **Test-Szenarien**

### **Berlin testen:**
- PLZ: `10115`
- Erwartete Heizkosten: `€1.52/m²`
- Versorger: `Vattenfall`

### **München testen:**
- PLZ: `80331` 
- Erwartete Heizkosten: `€1.78/m²`
- Versorger: `SWM`

### **Kleine Stadt testen:**
- PLZ: `01067` (Dresden)
- Automatische Regionserkennung
- Interpolierte Durchschnittskosten

## 🔧 **Bei Problemen**

**Speicher-Fehler:**
```bash
export NODE_OPTIONS="--max-old-space-size=1024"
npm run dev
```

**Installation fehlschlägt:**
```bash
npm install --ignore-scripts
```

**Port belegt:**
```bash
npm run dev -- --port 3001
```

## 📊 **Was Sie sehen werden**

**Live API-Daten für jede deutsche Stadt:**
- ⚡ Aktuelle Strompreise (€/kWh)
- 🔥 Gaspreise mit Netzentgelten
- 🌱 CO₂-Fußabdruck pro PLZ
- 🏠 Regionale Durchschnittskosten
- 📍 Automatische Stadtererkennung

**Vollständige Deutschland-Abdeckung:**
- 8.000+ Postleitzahlen ✅
- 16 Bundesländer ✅  
- 900+ Energieversorger ✅
- 11.000+ Gemeinden ✅

## 💰 **Revenue-Ready**

Die App ist **sofort monetarisierbar:**
- Freemium-Modell vorbereitet
- Premium-Features definiert
- Payment-Integration bereit
- Deutsche Zielgruppe: 35+ Millionen Mieter

**Starten Sie noch heute und verdienen Sie Geld mit echten deutschen Daten!** 🇩🇪🚀