# COPILOT TASK: Header-Standardisierung nach UI-Anker-Vorlage

## ZIEL
Standardisiere alle Header-Komponenten in Clara360 nach dem Design der Zahlungen-Seite.

## REFERENZ
- UI-Anker-Version: `/public/anker_ui_reference.html` (perfektes Dashboard-Design)
- Zahlungen-Seite: `src/components/ZahlungenPage.jsx` (perfektes Header-Design)

## AUFGABE
Passe folgende Komponenten an das Zahlungen-Header-Design an:

### 1. ObjektePage.jsx
- Header: Zurück-Button + Lila Icon + "Objekte" + "Übersicht aller Immobilien"
- Actions: Kartenansicht, Aktualisieren, Objekt hinzufügen

### 2. EigentuemerPage.jsx  
- Header: Zurück-Button + Orange Icon + "Eigentümer" + "Übersicht aller Eigentümer"
- Actions: Aktualisieren, Eigentümer hinzufügen

### 3. RueckstaendePage.jsx
- Header: Zurück-Button + Rotes Icon + "Rückstände" + "Übersicht offener Zahlungen"  
- Actions: Filter, Export, Aktualisieren, Rückstand hinzufügen

## DESIGN-PATTERN (von ZahlungenPage.jsx)
```jsx
<div className="mb-6">
  <div className="flex items-center gap-4 mb-4">
    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Zurück
    </Button>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
        <Euro className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Zahlungen</h1>
        <p className="text-gray-600">LocalStorage Modus +72 Transaktionen geladen</p>
      </div>
    </div>
  </div>
  
  <div className="flex gap-2 ml-14">
    <Button variant="outline">Aktualisieren</Button>
    <Button variant="outline">Exportieren</Button>
    <Button>Zahlung hinzufügen</Button>
  </div>
</div>
```

## WICHTIG
- Behalte das schöne Dashboard-Design bei
- Verwende einheitliche Icon-Farben (lila, orange, rot)
- Alle Header sollen identisch strukturiert sein
- Keine neuen Komponenten erstellen, bestehende anpassen

