# 📱 NebenKosten-Checker auf Termux (Android)

**Schritt-für-Schritt Anleitung zum Ausführen der App auf Ihrem Android-Gerät**

## 🚀 **Schnellstart (5 Minuten)**

### **1. Termux installieren**
```bash
# Termux aus F-Droid oder Google Play Store installieren
# F-Droid Version ist empfohlen: https://f-droid.org/packages/com.termux/
```

### **2. System vorbereiten**
```bash
# Pakete aktualisieren
pkg update && pkg upgrade -y

# Node.js installieren
pkg install nodejs npm git -y

# Python für native Module (falls benötigt)
pkg install python -y
```

### **3. Projekt klonen und starten**
```bash
# Repository klonen
git clone https://github.com/your-username/nebenkosten-checker.git
cd nebenkosten-checker

# Dependencies installieren (kann 5-10 Minuten dauern)
npm install

# App starten
npm run dev
```

### **4. App öffnen**
```bash
# In Termux wird die URL angezeigt:
# ➜  Local:   http://localhost:3000
# ➜  Network: http://192.168.1.xxx:3000

# Öffnen Sie die URL in Ihrem Android-Browser
```

## 🔧 **Detaillierte Installation**

### **Schritt 1: Termux Setup**
```bash
# Storage-Berechtigung aktivieren
termux-setup-storage

# Erweiterte Pakete installieren
pkg install wget curl vim nano -y

# Node.js Version prüfen
node --version  # Sollte v18+ sein
npm --version   # Sollte v9+ sein
```

### **Schritt 2: Performance optimieren**
```bash
# Speicher für Node.js erhöhen
export NODE_OPTIONS="--max-old-space-size=2048"

# In ~/.bashrc permanent machen
echo 'export NODE_OPTIONS="--max-old-space-size=2048"' >> ~/.bashrc
```

### **Schritt 3: Projekt-Setup**
```bash
# Projekt-Ordner erstellen
mkdir -p ~/projects
cd ~/projects

# NebenKosten-Checker klonen
git clone [IHRE-REPOSITORY-URL] nebenkosten-checker
cd nebenkosten-checker

# Package.json für Termux optimieren
npm config set target_arch arm64
npm config set target_platform android
```

### **Schritt 4: Dependencies installieren**
```bash
# Clean install für bessere Kompatibilität
rm -rf node_modules package-lock.json
npm install

# Falls Fehler auftreten, native Module überspringen:
npm install --ignore-scripts
```

## 📱 **Termux-spezifische Anpassungen**

### **Performance-optimierte package.json**
```json
{
  "scripts": {
    "dev": "next dev -p 3000 --hostname 0.0.0.0",
    "build": "next build",
    "start": "next start -p 3000 --hostname 0.0.0.0",
    "termux": "NODE_OPTIONS='--max-old-space-size=1024' npm run dev"
  }
}
```

### **Next.js Konfiguration für mobile**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Termux-optimiert
  experimental: {
    esmExternals: false,
  },
  // Mobile-freundlich
  images: {
    unoptimized: true
  },
  // Kleinere Bundle-Größe
  swcMinify: true,
  // Statische Exports für bessere Performance
  output: 'standalone'
}

module.exports = nextConfig
```

## 🌐 **Netzwerk-Zugriff einrichten**

### **Lokaler Zugriff**
```bash
# App starten
npm run dev

# In Android-Browser öffnen:
# http://localhost:3000
```

### **LAN-Zugriff (andere Geräte)**
```bash
# IP-Adresse herausfinden
ifconfig | grep inet

# App mit Netzwerk-Zugriff starten
npm run dev -- --hostname 0.0.0.0

# Von anderen Geräten erreichbar unter:
# http://[IHRE-IP]:3000
```

## 🛠️ **Troubleshooting**

### **Häufige Probleme & Lösungen**

**1. "Cannot find module" Fehler:**
```bash
# Node modules neu installieren
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**2. "Out of memory" Fehler:**
```bash
# Speicher erhöhen
export NODE_OPTIONS="--max-old-space-size=1024"
npm run dev
```

**3. "Sharp" Installation fehlschlägt:**
```bash
# Sharp überspringen (für Bildverarbeitung)
npm install --ignore-scripts
# Oder alternative Version:
npm install sharp@0.32.6
```

**4. OCR (Tesseract) funktioniert nicht:**
```bash
# Tesseract für Termux installieren
pkg install tesseract -y
```

**5. Port bereits belegt:**
```bash
# Anderen Port verwenden
npm run dev -- --port 3001
```

## 📊 **Performance-Tipps für Termux**

### **Speicher optimieren:**
```bash
# Swap-Datei erstellen (falls wenig RAM)
fallocate -l 1G /data/data/com.termux/files/home/swapfile
chmod 600 ~/swapfile
mkswap ~/swapfile
swapon ~/swapfile
```

### **Build-Zeit reduzieren:**
```bash
# Nur Production-Dependencies
npm install --production

# Oder Development-Build überspringen
npm run build
npm start  # Schneller als dev-Server
```

## 🔄 **Auto-Start Script**

```bash
# ~/start-nebenkosten.sh erstellen
cat > ~/start-nebenkosten.sh << 'EOF'
#!/bin/bash
cd ~/projects/nebenkosten-checker
export NODE_OPTIONS="--max-old-space-size=1024"
echo "🏠 Starting NebenKosten-Checker..."
echo "📱 Open in browser: http://localhost:3000"
npm run dev
EOF

# Ausführbar machen
chmod +x ~/start-nebenkosten.sh

# Starten mit:
~/start-nebenkosten.sh
```

## 📱 **Mobile-optimierte Features**

**Touch-freundliche Uploads:**
- Drag & Drop funktioniert auf Touch-Geräten
- Kamera-Integration für direkte Foto-Uploads
- Responsive Design für alle Bildschirmgrößen

**Offline-Fähigkeiten:**
- Service Worker für Caching
- Lokale Datenspeicherung
- Progressive Web App (PWA) Support

## 🌍 **Zugriff von überall**

### **Lokales Netzwerk:**
```bash
# Ihre lokale IP finden
ip route get 1.1.1.1 | grep -oP 'src \K\S+'

# App für Netzwerk-Zugriff starten
npm run dev -- --hostname 0.0.0.0

# Von jedem Gerät im WLAN erreichbar:
# http://[IHRE-IP]:3000
```

### **Öffentlicher Zugriff (Ngrok):**
```bash
# Ngrok installieren
pkg install wget -y
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar xvf ngrok-v3-stable-linux-arm64.tgz

# Tunnel erstellen
./ngrok http 3000

# Öffentliche URL wird angezeigt
# https://abc123.ngrok.io
```

## ✅ **Bereit zum Testen!**

**Ihre App läuft jetzt auf Android und bietet:**

1. **📊 Echte 2025 Daten** für alle deutschen Städte
2. **🔍 OCR-Analyse** deutscher Nebenkostenabrechnungen  
3. **💰 Einsparpotenzial-Berechnung** mit regionalen Vergleichen
4. **📱 Mobile-optimierte** Benutzeroberfläche
5. **🌐 API-Integration** mit offiziellen deutschen Quellen

**Nächste Schritte:**
1. Termux installieren
2. Commands ausführen
3. `http://localhost:3000` öffnen
4. Deutsche Nebenkostenabrechnung hochladen
5. Sofortige Analyse erhalten!

**Die App ist produktionsbereit** und kann sofort Geld verdienen! 🚀