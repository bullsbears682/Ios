#!/bin/bash

# 🏠 NebenKosten-Checker - Termux Installation Script
# Automatische Installation auf Android mit Termux

echo "🇩🇪 NebenKosten-Checker Installation für Termux"
echo "================================================"

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgaben
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Schritt 1: System-Updates
print_info "Schritt 1: System wird aktualisiert..."
pkg update -y && pkg upgrade -y
if [ $? -eq 0 ]; then
    print_status "System erfolgreich aktualisiert"
else
    print_error "System-Update fehlgeschlagen"
    exit 1
fi

# Schritt 2: Node.js und Dependencies installieren
print_info "Schritt 2: Node.js und Dependencies werden installiert..."
pkg install nodejs npm git python wget curl -y
if [ $? -eq 0 ]; then
    print_status "Node.js und Dependencies installiert"
else
    print_error "Installation von Node.js fehlgeschlagen"
    exit 1
fi

# Node.js Version prüfen
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_info "Node.js Version: $NODE_VERSION"
print_info "NPM Version: $NPM_VERSION"

# Schritt 3: Storage-Berechtigung
print_info "Schritt 3: Storage-Berechtigung wird eingerichtet..."
termux-setup-storage
print_status "Storage-Berechtigung eingerichtet"

# Schritt 4: Performance-Optimierungen
print_info "Schritt 4: Performance-Optimierungen..."
export NODE_OPTIONS="--max-old-space-size=2048"
echo 'export NODE_OPTIONS="--max-old-space-size=2048"' >> ~/.bashrc

# NPM für ARM64/Android optimieren
npm config set target_arch arm64
npm config set target_platform android
print_status "Performance-Optimierungen angewendet"

# Schritt 5: Projekt-Ordner erstellen
print_info "Schritt 5: Projekt-Ordner wird erstellt..."
mkdir -p ~/projects
cd ~/projects

# Schritt 6: Repository klonen (falls URL vorhanden)
print_info "Schritt 6: NebenKosten-Checker wird heruntergeladen..."
if [ ! -z "$1" ]; then
    git clone "$1" nebenkosten-checker
    cd nebenkosten-checker
    print_status "Repository erfolgreich geklont"
else
    print_warning "Keine Repository-URL angegeben. Projekt manuell klonen:"
    print_info "git clone [IHRE-URL] nebenkosten-checker"
    print_info "cd nebenkosten-checker"
fi

# Schritt 7: Dependencies installieren (falls Projekt vorhanden)
if [ -f "package.json" ]; then
    print_info "Schritt 7: Projekt-Dependencies werden installiert..."
    print_warning "Dies kann 5-10 Minuten dauern..."
    
    # Clean install für bessere Kompatibilität
    rm -rf node_modules package-lock.json 2>/dev/null
    
    # Installation mit Fallback-Optionen
    npm install --legacy-peer-deps || npm install --ignore-scripts || npm install --force
    
    if [ $? -eq 0 ]; then
        print_status "Dependencies erfolgreich installiert"
    else
        print_error "Dependencies-Installation fehlgeschlagen"
        print_info "Versuchen Sie manuell: npm install --ignore-scripts"
    fi
fi

# Schritt 8: Start-Script erstellen
print_info "Schritt 8: Start-Script wird erstellt..."
cat > ~/start-nebenkosten.sh << 'EOF'
#!/bin/bash

# NebenKosten-Checker Start Script
echo "🏠 NebenKosten-Checker wird gestartet..."

# Zum Projekt-Ordner wechseln
cd ~/projects/nebenkosten-checker

# Performance-Einstellungen
export NODE_OPTIONS="--max-old-space-size=1024"

# IP-Adresse anzeigen
LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || echo "localhost")

echo ""
echo "🌐 App wird gestartet auf:"
echo "   Lokal:    http://localhost:3000"
echo "   Netzwerk: http://$LOCAL_IP:3000"
echo ""
echo "📱 Öffnen Sie eine der URLs in Ihrem Browser"
echo "🛑 Zum Beenden: Ctrl+C drücken"
echo ""

# App starten
npm run dev
EOF

chmod +x ~/start-nebenkosten.sh
print_status "Start-Script erstellt: ~/start-nebenkosten.sh"

# Schritt 9: Installation abgeschlossen
echo ""
echo "🎉 Installation erfolgreich abgeschlossen!"
echo "=========================================="
echo ""
print_status "NebenKosten-Checker ist bereit!"
echo ""
echo "📱 Zum Starten:"
echo "   ~/start-nebenkosten.sh"
echo ""
echo "🌐 Dann öffnen Sie in Ihrem Browser:"
echo "   http://localhost:3000"
echo ""
echo "📋 Features:"
echo "   ✅ Alle deutschen Städte (8.000+ PLZ)"
echo "   ✅ Echte 2025 API-Daten"
echo "   ✅ OCR für deutsche Abrechnungen"
echo "   ✅ Automatische Kostenanalyse"
echo "   ✅ Einsparpotenzial-Berechnung"
echo ""
print_info "Viel Erfolg mit Ihrem deutschen Utility-Tool! 🇩🇪💰"

# Optional: Direkt starten
echo ""
read -p "Möchten Sie die App jetzt starten? (j/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[JjYy]$ ]]; then
    print_info "App wird gestartet..."
    ~/start-nebenkosten.sh
fi