# Clara Cockpit v2.3

**KI-gestützte Hausverwaltungsplattform mit React-Architektur**

## 🎯 Überblick

Clara Cockpit ist eine moderne, React-basierte Hausverwaltungsplattform mit integrierter KI-Unterstützung und Banking-Integration für das Waldhofstraße-Objekt.

## 🏗️ Architektur

### React-First Approach
- **Framework:** React 18 + Vite
- **UI Library:** shadcn/ui + Tailwind CSS
- **Icons:** Lucide React
- **Development:** GitHub Copilot assisted

### Komponenten-Struktur
```
src/
├── components/
│   ├── ui/                 # shadcn/ui Komponenten
│   ├── ManifestViewer.jsx  # MetaGovernor Manifest-Kontrolle
│   └── legacy/             # Archivierte Komponenten
├── clarafusion/            # Clara Fusion Engine
├── hooks/                  # Custom React Hooks
└── assets/                 # Statische Assets
```

## 🔐 MetaGovernor Integration

### Manifest-Kontrolle
- **Authentifizierung:** hiss@clara360.de
- **Passwort:** Clara360!
- **Zugriff:** Manifest-Button unten rechts (nur für MetaGovernor)
- **Funktionen:** Read/Edit-Modus für MANUS_MANIFEST.md

### Sicherheitsfeatures
- Session-basierte Authentifizierung
- Manifest Guard Validierung
- Automatische Changelog-Generierung

## 🏦 Banking Integration

### FinAPI Konfiguration
- **Environment:** LIVE_READY (Sandbox to Live)
- **Target Bank:** Sparkasse Mannheim
- **Objekt:** Waldhofstraße
- **Features:** Selective Banking, KPI-Module

### KPI-Module
1. **Rentflow Analytics** - Mieteingang-Analyse
2. **Account Balance** - Kontostand-Überwachung
3. **Delta 30 Days** - Monatliche Bewegungen
4. **Rent Tracking** - Mieteingang vs. Soll
5. **Payment Timing** - Zahlungseingang-Tracking
6. **Transaction Timeline** - Bankbewegungen

## 🚀 Development

### Lokale Entwicklung
```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Produktion
npm run build

# Preview der Production Build
npm run preview
```

### Deployment
```bash
# Manifest Guard Validierung
node manifest_guard.js

# Git Commit mit Copilot
git add .
git commit -m "feat: Phase 2.3 Manifest Integration"

# Push zu GitHub
git push origin main

# VPS Deployment
ssh root@217.154.242.134
cd /var/www/clara360
git pull origin main
npm run build
systemctl restart nginx
```

## 📋 Phase 2.3 Features

### ✅ Abgeschlossen
- [x] Manifest-Vereinheitlichung (ClaraSuper_v4.4.0_WaldhofstrasseLive)
- [x] ManifestViewer Komponente mit MetaGovernor-Auth
- [x] GitHub Copilot Integration
- [x] Manifest Guard Validierung
- [x] React-First Architektur

### 🔄 In Entwicklung
- [ ] VPS Production Deployment
- [ ] Live Banking Integration Test
- [ ] KPI-Module UI Implementation
- [ ] Performance Optimierung

## 🔗 Wichtige Links

- **GitHub Repository:** https://github.com/TyrionX68/ClaraCockpit
- **VPS Server:** root@217.154.242.134
- **Manifest:** `/context_tracking/MANUS_MANIFEST.md`
- **Live System:** ClaraSuper_v4.4.0_WaldhofstrasseLive

## 📞 Support

**MetaGovernor Kontakt:** hiss@clara360.de  
**System Status:** LIVE_READY  
**Entwicklung:** Manus A (mit GitHub Copilot)

---

**Entwickelt mit ❤️ und 🤖 GitHub Copilot für die Waldhofstraße Hausverwaltung**

