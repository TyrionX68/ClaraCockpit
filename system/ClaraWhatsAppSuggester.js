/**
 * ClaraWhatsAppSuggester.js
 * WhatsApp-Integration für Clara-KI
 * Generiert WhatsApp-Nachrichten-Vorlagen basierend auf Intent und Slot
 */

export class ClaraWhatsAppSuggester {
  
  /**
   * WhatsApp-Templates für verschiedene Intents
   */
  static templates = {
    rueckstand_mahnung: {
      subject: "Zahlungserinnerung",
      message: "Hallo {mieter_name}, wir möchten Sie freundlich daran erinnern, dass für {property_address} noch ein Betrag von {amount}€ offen ist. Bitte überweisen Sie den Betrag bis zum {due_date}. Bei Fragen stehen wir gerne zur Verfügung. Beste Grüße, Ihr Vermieter-Team"
    },
    wartung_termin: {
      subject: "Wartungstermin",
      message: "Hallo {mieter_name}, für {property_address} ist eine {wartung_type} geplant. Wir würden gerne einen Termin in der Woche vom {week_start} vereinbaren. Bitte teilen Sie uns Ihre Verfügbarkeit mit. Vielen Dank!"
    },
    miete_bestaetigung: {
      subject: "Mietzahlung erhalten",
      message: "Hallo {mieter_name}, vielen Dank für Ihre pünktliche Mietzahlung von {amount}€ für {property_address}. Die Zahlung ist bei uns eingegangen. Beste Grüße!"
    },
    allgemeine_info: {
      subject: "Information zu Ihrer Immobilie",
      message: "Hallo {mieter_name}, bezüglich {property_address} möchten wir Sie über folgendes informieren: {info_text}. Bei Fragen stehen wir gerne zur Verfügung."
    }
  };

  /**
   * Prüft ob für einen Intent WhatsApp-Vorschläge verfügbar sind
   */
  static hasWhatsAppSuggestion(intent, slots = {}) {
    const whatsappIntents = ['rueckstaende', 'wartung', 'miete', 'allgemein'];
    return whatsappIntents.some(wi => intent.includes(wi));
  }

  /**
   * Generiert WhatsApp-Vorschlag basierend auf Intent und Slots
   */
  static generateWhatsAppSuggestion(intent, slots = {}, originalResponse = "") {
    console.log('[WHATSAPP SUGGESTER] Generating suggestion for intent:', intent, 'slots:', slots);
    
    let template = null;
    let templateKey = null;

    // Intent-basierte Template-Auswahl
    if (intent.includes('rueckstaende') || intent.includes('rückstand')) {
      template = this.templates.rueckstand_mahnung;
      templateKey = 'rueckstand_mahnung';
    } else if (intent.includes('wartung')) {
      template = this.templates.wartung_termin;
      templateKey = 'wartung_termin';
    } else if (intent.includes('miete')) {
      template = this.templates.miete_bestaetigung;
      templateKey = 'miete_bestaetigung';
    } else {
      template = this.templates.allgemeine_info;
      templateKey = 'allgemeine_info';
    }

    // Slots für Template-Variablen vorbereiten
    const templateVars = {
      mieter_name: slots.mieter || "Herr/Frau Mustermann",
      property_address: slots.property || "Ihre Immobilie",
      amount: slots.amount || "XXX",
      due_date: this.getNextDueDate(),
      week_start: this.getNextWeekStart(),
      wartung_type: slots.wartung_type || "Wartung",
      info_text: originalResponse || "weitere Informationen"
    };

    // Template mit Variablen füllen
    const filledMessage = this.fillTemplate(template.message, templateVars);

    return {
      text: originalResponse + "\n\n💬 Soll ich das als WhatsApp-Nachricht vorbereiten?",
      action: {
        type: "whatsapp",
        template: templateKey,
        subject: template.subject,
        message: filledMessage,
        recipient: templateVars.mieter_name,
        property: templateVars.property_address
      },
      buttons: [
        {
          text: "📱 WhatsApp-Nachricht erstellen",
          action: "create_whatsapp",
          data: {
            template: templateKey,
            message: filledMessage,
            subject: template.subject
          }
        },
        {
          text: "📋 Nachricht kopieren",
          action: "copy_message",
          data: {
            message: filledMessage
          }
        }
      ]
    };
  }

  /**
   * Füllt Template-Variablen in Nachricht
   */
  static fillTemplate(message, vars) {
    let filled = message;
    Object.keys(vars).forEach(key => {
      const placeholder = `{${key}}`;
      filled = filled.replace(new RegExp(placeholder, 'g'), vars[key]);
    });
    return filled;
  }

  /**
   * Hilfsfunktion: Nächstes Fälligkeitsdatum
   */
  static getNextDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 14); // 14 Tage ab heute
    return date.toLocaleDateString('de-DE');
  }

  /**
   * Hilfsfunktion: Nächster Wochenanfang
   */
  static getNextWeekStart() {
    const date = new Date();
    const nextMonday = new Date(date);
    nextMonday.setDate(date.getDate() + (7 - date.getDay() + 1));
    return nextMonday.toLocaleDateString('de-DE');
  }

  /**
   * Verarbeitet WhatsApp-Button-Klicks
   */
  static handleWhatsAppAction(action, data) {
    console.log('[WHATSAPP SUGGESTER] Handling action:', action, data);
    
    switch(action) {
      case 'create_whatsapp':
        // Öffne WhatsApp Web mit vorbefüllter Nachricht
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(data.message)}`;
        window.open(whatsappUrl, '_blank');
        return "WhatsApp-Nachricht wurde geöffnet!";
        
      case 'copy_message':
        // Kopiere Nachricht in Zwischenablage
        navigator.clipboard.writeText(data.message);
        return "Nachricht wurde in die Zwischenablage kopiert!";
        
      default:
        return "Unbekannte Aktion.";
    }
  }
}

export default ClaraWhatsAppSuggester;

