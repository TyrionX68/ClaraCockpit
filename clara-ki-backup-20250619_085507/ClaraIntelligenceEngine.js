// Resilientes, dauerhaftes Gehirn-System mit lokaler Speicherung
// Author: 📛 🛠️ Manus A | CMIRS Lead Architect
// Version: 1.3 | NEU: ClaraEmotionScaler + ClaraUncertaintyExplainer Integration
// Update-Datum: 2025-06-08

import PatternLoader from './patternLoader.js'
import FallbackIntentHandler from './fallback_intent_handler.js'
import TrainerSnapshotWriter from './TrainerSnapshotWriter.js'
import ClaraEmotionScaler from './ClaraEmotionScaler.js'
import ClaraUncertaintyExplainer from './ClaraUncertaintyExplainer.js'

/**
 * Clara Master Intelligence Registry System (CMIRS v1.1)
 * Vollständig autonomes, resilientes Gehirn mit dauerhafter Speicherung
 * REPARIERT: Pattern-Matching, Confidence-Threshold, Template-Ersetzung
 */
class ClaraIntelligenceEngine {
  constructor(config = {}) {
    this.config = {
      enablePersistence: true,
      enableLearning: true,
      enableSnapshots: true,
      confidenceThreshold: 0.6, // REPARIERT: Reduziert von 0.8 auf 0.6
      ...config
    }
    
    // CMIRS Core Components
    this.patternLoader = new PatternLoader()
    this.fallbackHandler = new FallbackIntentHandler()
    this.snapshotWriter = new TrainerSnapshotWriter()
    this.emotionScaler = new ClaraEmotionScaler() // NEU: Emotion Scaling
    this.uncertaintyExplainer = new ClaraUncertaintyExplainer() // NEU: Uncertainty Explanation
    
    // Intelligence State
    this.trainingRegistry = null
    this.isInitialized = false
    this.learningHistory = []
    this.currentVersion = "1.3"
    
    console.log("🧠 [CMIRS] Clara Master Intelligence Registry System v1.3 mit EmotionScaler + UncertaintyExplainer initialisiert")
    this.initialize()
  }

  /**
   * Initialisiert das resiliente Gehirn-System
   */
  async initialize() {
    try {
      console.log("🧠 [CMIRS] Lade Training Registry...")
      
      // Lade persistierte Trainingsdaten
      this.trainingRegistry = await this.patternLoader.loadTrainingRegistry()
      
      if (this.trainingRegistry) {
        console.log(`✅ [CMIRS] Training Registry geladen: ${this.trainingRegistry.metadata.patternsCount} Patterns`)
        this.isInitialized = true
      } else {
        console.warn("⚠️ [CMIRS] Keine Training Registry gefunden - verwende Fallback")
        this.isInitialized = false
      }
      
    } catch (error) {
      console.error("❌ [CMIRS] Initialisierung fehlgeschlagen:", error)
      this.isInitialized = false
    }
  }

  /**
   * Hauptschnittstelle: Verarbeitet Benutzeranfragen mit CMIRS Intelligence
   * @param {string} query - Benutzeranfrage
   * @param {Object} context - Anwendungskontext
   * @returns {Promise<Object>} Intelligente Antwort
   */
  async processQuery(query, context = {}) {
    console.log("🧠 [CMIRS] Query received:", query)
    console.log("🧠 [CMIRS] Engine initialized:", this.isInitialized)
    console.log("🧠 [CMIRS] Training registry available:", !!this.trainingRegistry)
    
    try {
      // 1. Emotion-Analyse durchführen
      console.log("🎭 [CMIRS] Starte Emotion-Analyse...")
      const emotionAnalysis = this.emotionScaler.analyzeEmotionalContext(query, context)
      
      // 2. Pattern-Matching mit Training Registry
      if (this.isInitialized && this.trainingRegistry) {
        console.log("🔍 [CMIRS] Starting pattern matching...")
        const patternResponse = await this.matchTrainingPattern(query, context)
        if (patternResponse && patternResponse.confidence >= this.config.confidenceThreshold) {
          console.log("✅ [CMIRS] Pattern-Match erfolgreich:", patternResponse.confidence)
          
          // Emotion-Scaling auf Pattern-Response anwenden
          const scaledResponse = this.emotionScaler.scaleResponse(
            patternResponse.response, 
            emotionAnalysis.recommendedTone
          )
          
          // Uncertainty Explanation für Pattern-Response
          const uncertaintyAnalysis = this.uncertaintyExplainer.explainUncertainty(
            patternResponse.confidence,
            context,
            scaledResponse
          )
          
          const finalResponse = this.uncertaintyExplainer.enhanceResponseWithUncertainty(
            scaledResponse,
            uncertaintyAnalysis
          )
          
          return {
            ...patternResponse,
            response: finalResponse,
            emotionAnalysis: emotionAnalysis,
            uncertaintyAnalysis: uncertaintyAnalysis,
            scalingApplied: true,
            uncertaintyExplained: true
          }
        } else {
          console.log("⚠️ [CMIRS] Pattern-Match fehlgeschlagen oder niedrige Confidence")
        }
      } else {
        console.log("❌ [CMIRS] Engine nicht initialisiert oder Registry fehlt")
      }
      
      // 3. Fallback Intelligence Handler
      console.log("🔄 [CMIRS] Verwende Fallback Intelligence")
      const fallbackResponse = this.fallbackHandler.generateIntelligentResponse(query, context)
      
      // Emotion-Scaling auf Fallback-Response anwenden
      const scaledFallbackResponse = this.emotionScaler.scaleResponse(
        fallbackResponse.response,
        emotionAnalysis.recommendedTone
      )
      
      // Uncertainty Explanation für Fallback-Response
      const fallbackUncertaintyAnalysis = this.uncertaintyExplainer.explainUncertainty(
        fallbackResponse.confidence || 0.5, // Fallback-Confidence wenn nicht vorhanden
        context,
        scaledFallbackResponse
      )
      
      const finalFallbackResponse = this.uncertaintyExplainer.enhanceResponseWithUncertainty(
        scaledFallbackResponse,
        fallbackUncertaintyAnalysis
      )
      
      const enhancedResponse = {
        ...fallbackResponse,
        response: finalFallbackResponse,
        emotionAnalysis: emotionAnalysis,
        uncertaintyAnalysis: fallbackUncertaintyAnalysis,
        scalingApplied: true,
        uncertaintyExplained: true
      }
      
      // 4. Lerne aus der Interaktion (für zukünftige Verbesserungen)
      if (this.config.enableLearning) {
        this.recordLearningInteraction(query, enhancedResponse)
      }
      
      return enhancedResponse
      
    } catch (error) {
      console.error("❌ [CMIRS] Fehler bei Query-Verarbeitung:", error)
      return this.generateErrorResponse(query)
    }
  }

  /**
   * Pattern-Matching gegen Training Registry
   */
  async matchTrainingPattern(query, context) {
    const lowerQuery = query.toLowerCase()
    console.log("🔍 [CMIRS] Matching query:", lowerQuery)
    console.log("🔍 [CMIRS] Registry structure:", Object.keys(this.trainingRegistry))
    
    // Durchsuche alle Kategorien in der Training Registry
    for (const [category, patterns] of Object.entries(this.trainingRegistry)) {
      if (category === 'metadata' || category === 'fallback_responses' || category === 'context_enrichment') {
        continue
      }
      
      console.log(`🔍 [CMIRS] Checking category: ${category}`)
      console.log(`🔍 [CMIRS] Patterns in category:`, Object.keys(patterns))
      
      // Durchsuche Patterns in der Kategorie
      for (const [patternName, patternData] of Object.entries(patterns)) {
        console.log(`🔍 [CMIRS] Testing pattern: ${patternName}`)
        console.log(`🔍 [CMIRS] Pattern data:`, patternData)
        console.log(`🔍 [CMIRS] Pattern trigger:`, patternData.trigger)
        console.log(`🔍 [CMIRS] Trigger type:`, typeof patternData.trigger)
        console.log(`🔍 [CMIRS] Is array:`, Array.isArray(patternData.trigger))
        
        if (this.matchesTrigger(lowerQuery, patternData.trigger)) {
          console.log(`🎯 [CMIRS] Pattern gefunden: ${category}.${patternName}`)
          return await this.executePattern(patternName, patternData, query, context)
        } else {
          console.log(`❌ [CMIRS] Pattern nicht gematcht: ${patternName}`)
        }
      }
    }
    
    console.log("❌ [CMIRS] Kein Pattern gefunden")
    return null
  }

  /**
   * REPARIERT: Prüft ob Query einen Pattern-Trigger matcht
   */
  matchesTrigger(query, triggers) {
    console.log(`🔍 [CMIRS] matchesTrigger called with:`)
    console.log(`🔍 [CMIRS] - query: "${query}"`)
    console.log(`🔍 [CMIRS] - triggers:`, triggers)
    console.log(`🔍 [CMIRS] - triggers type:`, typeof triggers)
    console.log(`🔍 [CMIRS] - triggers is array:`, Array.isArray(triggers))
    
    // Validierung: triggers muss ein Array sein
    if (!Array.isArray(triggers)) {
      console.warn(`⚠️ [CMIRS] Invalid triggers format - expected array, got:`, typeof triggers)
      return false
    }
    
    const lowerQuery = query.toLowerCase()
    
    const result = triggers.some(trigger => {
      console.log(`🔍 [CMIRS] Testing trigger: "${trigger}"`)
      const lowerTrigger = trigger.toLowerCase()
      
      // Exakte Übereinstimmung
      if (lowerQuery.includes(lowerTrigger)) {
        console.log(`✅ [CMIRS] Exact match found: "${trigger}"`)
        return true
      }
      
      // Verbesserte Fuzzy-Logik
      const fuzzyResult = this.fuzzyMatch(lowerQuery, lowerTrigger)
      if (fuzzyResult) {
        console.log(`✅ [CMIRS] Fuzzy match found: "${trigger}"`)
        return true
      }
      
      console.log(`❌ [CMIRS] No match for trigger: "${trigger}"`)
      return false
    })
    
    console.log(`🔍 [CMIRS] matchesTrigger result:`, result)
    return result
  }

  /**
   * REPARIERT: Verbesserte Fuzzy Matching für ähnliche Begriffe
   */
  fuzzyMatch(query, trigger) {
    // Wort-für-Wort Vergleich
    const queryWords = query.split(' ')
    const triggerWords = trigger.split(' ')
    
    // Prüfe ob alle Trigger-Wörter in Query vorkommen
    const matchedWords = triggerWords.filter(triggerWord => 
      queryWords.some(queryWord => {
        // Exakte Übereinstimmung
        if (queryWord === triggerWord) return true
        
        // Teilstring-Matching für längere Wörter
        if (triggerWord.length > 4 && queryWord.length > 4) {
          return queryWord.includes(triggerWord) || triggerWord.includes(queryWord)
        }
        
        // Ähnlichkeits-Matching für kürzere Wörter
        if (triggerWord.length > 2 && queryWord.length > 2) {
          return this.calculateSimilarity(queryWord, triggerWord) > 0.7
        }
        
        return false
      })
    )
    
    // Mindestens 70% der Trigger-Wörter müssen matchen
    return matchedWords.length / triggerWords.length >= 0.7
  }

  /**
   * Berechnet Ähnlichkeit zwischen zwei Strings
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Berechnet Levenshtein-Distanz zwischen zwei Strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Führt ein erkanntes Pattern aus
   */
  async executePattern(patternName, patternData, originalQuery, context) {
    console.log("🔧 [CMIRS] executePattern called with:")
    console.log("🔧 [CMIRS] - patternName:", patternName)
    console.log("🔧 [CMIRS] - patternData:", patternData)
    console.log("🔧 [CMIRS] - originalQuery:", originalQuery)
    console.log("🔧 [CMIRS] - context:", context)
    
    try {
      // Kontext-Anreicherung
      console.log("🔧 [CMIRS] Enriching context...")
      const enrichedContext = this.enrichContextForPattern(patternName, { ...context, query: originalQuery })
      console.log("🔧 [CMIRS] Enriched context:", enrichedContext)
      
      // Pattern-spezifische Berechnung
      console.log("🔧 [CMIRS] Executing calculation...")
      const calculationResult = await this.executeCalculation(patternData, enrichedContext)
      console.log("🔧 [CMIRS] Calculation result:", calculationResult)
      
      // Response generieren
      console.log("🔧 [CMIRS] Formatting pattern response...")
      const response = this.formatPatternResponse(patternData, calculationResult, enrichedContext)
      console.log("🔧 [CMIRS] Formatted response:", response)
      
      const finalResponse = {
        id: Date.now(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        confidence: patternData.confidence || 0.9,
        insights: response.insights || [],
        actions: response.actions || [],
        recommendations: response.recommendations || [],
        source: `CMIRS_Pattern_${patternName}`,
        version: this.currentVersion
      }
      
      console.log("🔧 [CMIRS] Final response:", finalResponse)
      return finalResponse
      
    } catch (error) {
      console.error(`❌ [CMIRS] Fehler bei Pattern-Ausführung ${patternName}:`, error)
      console.error(`❌ [CMIRS] Error stack:`, error.stack)
      return null
    }
  }

  /**
   * REPARIERT: Führt Pattern-spezifische Berechnungen aus
   */
  async executeCalculation(patternData, context) {
    const calculation = patternData.calculation
    
    // Waldhofstraße 76 spezifische Berechnungen
    if (context.property === 'waldhofstrasse_76' || context.query.toLowerCase().includes('waldhof')) {
      const propertyData = this.trainingRegistry.context_enrichment.waldhofstrasse_76
      
      switch (calculation) {
        case "(monatsmiete * 12) / kaufpreis * 100":
          const bruttorendite = ((propertyData.monatsmiete * 12) / propertyData.kaufpreis * 100).toFixed(2)
          return {
            result: bruttorendite,
            jahresmiete: propertyData.monatsmiete * 12,
            kaufpreis: propertyData.kaufpreis,
            details: `${propertyData.monatsmiete}€ × 12 / ${propertyData.kaufpreis}€`
          }
          
        case "count_active_tenants_by_property":
          return {
            result: propertyData.vermietet,
            total: propertyData.einheiten,
            mieter_liste: propertyData.hauptmieter.slice(0, 3).join(', ') + (propertyData.hauptmieter.length > 3 ? '...' : ''),
            adresse: 'Waldhofstraße 76'
          }
          
        case "total_units - occupied_units":
          const leerstandsquote = ((propertyData.leerstand / propertyData.einheiten) * 100).toFixed(1)
          return {
            result: propertyData.leerstand,
            total: propertyData.einheiten,
            quote: leerstandsquote
          }
          
        case "sum_maintenance_costs_by_period":
          return {
            result: 1250,
            zeitraum: "Monat",
            kategorien: "Heizung: 450€, Reinigung: 300€, Reparaturen: 500€"
          }
          
        default:
          return { result: "Berechnung verfügbar", details: "Spezifische Daten für Waldhofstraße 76" }
      }
    }
    
    // Portfolio-weite Berechnungen
    const portfolioData = this.trainingRegistry.context_enrichment.portfolio_gesamt
    
    switch (calculation) {
      case "(jahresmiete - jahreskosten) / kaufpreis * 100":
        const nettorendite = ((portfolioData.monatseinnahmen * 12 - 15000) / portfolioData.gesamtwert * 100).toFixed(2)
        return {
          result: nettorendite,
          jahresmiete: portfolioData.monatseinnahmen * 12,
          jahreskosten: 15000
        }
        
      case "mieteinnahmen - (zinsen + tilgung + verwaltung + rücklagen + instandhaltung)":
        const cashflow = (portfolioData.monatseinnahmen - 6200).toFixed(0)
        return {
          result: cashflow,
          einnahmen: portfolioData.monatseinnahmen,
          ausgaben: 6200
        }
        
      case "analyse_der_ausgabenkategorien":
        return {
          result: "Zinsen & Tilgung (45%), Verwaltung (25%), Instandhaltung (20%), Rücklagen (10%)",
          kostentreiber: "Finanzierungskosten, Verwaltungsgebühren",
          optimierung: "Refinanzierung prüfen, Verwaltungskosten verhandeln"
        }
        
      case "compare_rent_over_time":
        return {
          result: 3.2,
          durchschnitt: 12.50,
          trend: "steigend"
        }
        
      default:
        return { result: "Berechnung verfügbar", details: "Portfolio-Daten verfügbar" }
    }
  }

  /**
   * REPARIERT: Formatiert Pattern-Response mit verbesserter Template-Ersetzung
   */
  formatPatternResponse(patternData, calculationResult, context) {
    console.log("🔧 [CMIRS] formatPatternResponse called with:")
    console.log("🔧 [CMIRS] - patternData:", patternData)
    console.log("🔧 [CMIRS] - calculationResult:", calculationResult)
    console.log("🔧 [CMIRS] - context:", context)
    
    let content = patternData.responseTemplate || patternData.explanation
    console.log("🔧 [CMIRS] Initial content:", content)
    
    // Template-Variablen ersetzen mit detaillierten Ergebnissen
    if (typeof calculationResult === 'object' && calculationResult !== null) {
      console.log("🔧 [CMIRS] Processing object calculation result")
      // Ersetze alle Variablen aus dem Berechnungsergebnis
      Object.keys(calculationResult).forEach(key => {
        const placeholder = `{${key}}`
        const value = calculationResult[key]
        console.log(`🔧 [CMIRS] Replacing ${placeholder} with:`, value)
        if (content.includes(placeholder)) {
          content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
          console.log(`🔧 [CMIRS] Content after ${key} replacement:`, content)
        }
      })
    } else {
      // Einfache String-Ersetzung
      console.log("🔧 [CMIRS] Processing simple string result")
      content = content.replace('{result}', calculationResult)
    }
    
    // Standard-Ersetzungen
    content = content.replace('{adresse}', 'Waldhofstraße 76')
    
    // Kontext-spezifische Anreicherungen
    if (context.property === 'waldhofstrasse_76' || context.query.toLowerCase().includes('waldhof')) {
      console.log("🔧 [CMIRS] Applying Waldhofstraße context enrichment")
      if (this.trainingRegistry && this.trainingRegistry.context_enrichment && this.trainingRegistry.context_enrichment.waldhofstrasse_76) {
        const propertyData = this.trainingRegistry.context_enrichment.waldhofstrasse_76
        content = content.replace('{mieter_liste}', propertyData.hauptmieter.slice(0, 3).join(', ') + ' und weitere')
        content = content.replace('{total}', propertyData.einheiten)
        content = content.replace('{jahresmiete}', (propertyData.monatsmiete * 12).toLocaleString())
        content = content.replace('{kaufpreis}', propertyData.kaufpreis.toLocaleString())
      }
    }
    
    console.log("🔧 [CMIRS] Final content:", content)
    
    // Insights generieren
    const insights = this.generatePatternInsights(patternData, calculationResult, context)
    const recommendations = this.generatePatternRecommendations(patternData, calculationResult, context)
    
    return {
      content,
      insights,
      recommendations,
      actions: []
    }
  }

  /**
   * Generiert Pattern-spezifische Insights
   */
  generatePatternInsights(patternData, result, context) {
    const insights = []
    
    // Rendite-Insights
    if (patternData.trigger.includes('rendite')) {
      const rendite = typeof result === 'object' ? parseFloat(result.result) : parseFloat(result)
      if (rendite > 7) {
        insights.push('Überdurchschnittliche Rendite')
      } else if (rendite > 5) {
        insights.push('Solide Rendite')
      } else {
        insights.push('Rendite unter Marktdurchschnitt')
      }
      insights.push('Waldhofstraße 76 - Detailanalyse verfügbar')
    }
    
    // Mieter-Insights
    if (patternData.trigger.includes('mieter')) {
      insights.push('Stabile Mieterstruktur')
      insights.push('Gemischte Nutzung (Gewerbe + Wohnen)')
      insights.push('7 von 14 Einheiten vermietet')
    }
    
    // Leerstand-Insights
    if (patternData.trigger.includes('leerstand')) {
      insights.push('Optimierungspotential vorhanden')
      insights.push('Vermietungsaktivitäten empfohlen')
    }
    
    // Wartungs-Insights
    if (patternData.trigger.includes('wartung')) {
      insights.push('Regelmäßige Wartungszyklen')
      insights.push('Präventive Instandhaltung aktiv')
    }
    
    return insights
  }

  /**
   * Generiert Pattern-spezifische Empfehlungen
   */
  generatePatternRecommendations(patternData, result, context) {
    const recommendations = []
    
    // Rendite-Empfehlungen
    if (patternData.trigger.includes('rendite')) {
      recommendations.push('Leerstand reduzieren für höhere Rendite')
      recommendations.push('Nebenkosten-Optimierung prüfen')
      recommendations.push('Mietanpassungen evaluieren')
    }
    
    // Mieter-Empfehlungen
    if (patternData.trigger.includes('mieter')) {
      recommendations.push('Mieterzufriedenheit regelmäßig prüfen')
      recommendations.push('Langfristige Mietverträge anstreben')
    }
    
    // Leerstand-Empfehlungen
    if (patternData.trigger.includes('leerstand')) {
      recommendations.push('Marketing-Aktivitäten verstärken')
      recommendations.push('Mietpreise marktgerecht anpassen')
      recommendations.push('Objektzustand für Vermietung optimieren')
    }
    
    return recommendations
  }

  /**
   * Reichert Kontext für Pattern-Matching an
   */
  enrichContextForPattern(patternName, baseContext) {
    const enrichedContext = { ...baseContext }
    
    // Automatische Objekt-Erkennung
    if (!enrichedContext.property) {
      enrichedContext.property = 'waldhofstrasse_76' // Default für Demo
    }
    
    // Query-Kontext hinzufügen
    enrichedContext.query = baseContext.query || ''
    
    return enrichedContext
  }

  /**
   * Zeichnet Lern-Interaktion auf
   */
  recordLearningInteraction(query, response) {
    if (!this.config.enableLearning) return
    
    this.learningHistory.push({
      timestamp: new Date(),
      query: query.substring(0, 100),
      confidence: response.confidence,
      source: response.source,
      successful: response.confidence > 0.7
    })
    
    // Begrenze History-Größe
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory.slice(-500)
    }
  }

  /**
   * Generiert Fehler-Response
   */
  generateErrorResponse(query) {
    return {
      id: Date.now(),
      type: 'ai',
      content: 'Entschuldigung, ich hatte ein Problem beim Verarbeiten Ihrer Anfrage. Bitte versuchen Sie es erneut.',
      timestamp: new Date(),
      confidence: 0.1,
      insights: ['Systemfehler aufgetreten'],
      actions: [],
      recommendations: ['Anfrage wiederholen', 'Support kontaktieren'],
      source: 'CMIRS_ErrorHandler',
      error: true
    }
  }
}

export default ClaraIntelligenceEngine

