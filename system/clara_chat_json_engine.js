console.log("🔌 Clara JSON-Chat gestartet");

setTimeout(() => {
  try {
    // MetaGovernor-optimierte DOM-Selektoren
    const input = document.querySelector('input[placeholder*="Clara"], input[placeholder*="Fragen"]');
    const sendBtn = [...document.querySelectorAll("button")].find(btn =>
      btn.textContent.trim().toLowerCase().includes("senden")
    );

    if (!input || !sendBtn) {
      console.warn("❌ Clara-Chat DOM nicht vollständig gefunden");
      console.log("🔍 Verfügbare Inputs:", document.querySelectorAll("input"));
      console.log("🔍 Verfügbare Buttons:", [...document.querySelectorAll("button")].map(b => b.textContent));
      return;
    }

    console.log("✅ Clara-Chat DOM aktiv – JSON-Modus");
    console.log("📍 Input gefunden:", input.placeholder);
    console.log("📍 Button gefunden:", sendBtn.textContent);

    // MetaGovernor Bubble-Patch: Echten Chat-Container finden
    let chatContainer = document.querySelector('.clara-chat') || 
                       document.querySelector('[class*="chat-area"]') ||
                       document.querySelector('[class*="chat-container"]') ||
                       document.querySelector('.chat-history') ||
                       document.querySelector('[class*="bubble-container"]');

    // Fallback: Chat-Container im Clara KI-Chat Bereich suchen
    if (!chatContainer) {
      const claraSection = [...document.querySelectorAll('*')].find(el => 
        el.textContent?.includes('Clara KI-Chat') || 
        el.textContent?.includes('Hallo! Ich bin Clara')
      );
      if (claraSection) {
        chatContainer = claraSection.closest('div') || claraSection.parentElement;
      }
    }

    // Letzter Fallback: Container neben Input erstellen
    if (!chatContainer) {
      const chatArea = input.closest("main") || input.parentElement?.parentElement;
      if (chatArea) {
        chatContainer = document.createElement("div");
        chatContainer.className = "clara-chat bubble-container";
        chatContainer.style.cssText = `
          margin-top: 16px;
          max-height: 400px;
          overflow-y: auto;
          padding: 12px;
          background: transparent;
          font-family: system-ui, -apple-system, sans-serif;
        `;
        chatArea.appendChild(chatContainer);
        console.log("📦 Bubble-Container erstellt");
      }
    }

    if (chatContainer) {
      console.log("🎯 Chat-Container gefunden:", chatContainer.className);
    }

    // Event-Handler mit Bubble-Patch
    sendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const value = input.value.trim();
      if (!value) return;

      console.log("📤 Nachricht gesendet:", value);

      try {
        // JSON-Antworten laden
        const res = await fetch('/data/clara_ki_responses.json');
        const data = await res.json();
        console.log("📚 JSON-Responses geladen:", data.length, "Einträge");

        // Keyword-Matching
        const userInput = value.toLowerCase();
        const match = data.find(entry =>
          entry.match.some(trigger => userInput.includes(trigger.toLowerCase()))
        );

        const response = match?.response || "Dazu habe ich aktuell keine spezifischen Daten. Können Sie präziser fragen? Ich kann zu Mieten, Rückständen, Wartung, Cashflow oder Rendite helfen.";

        // MetaGovernor Bubble-Patch: User-Nachricht als Bubble
        const userBubble = document.createElement("div");
        userBubble.className = "bubble bubble-user";
        userBubble.innerHTML = `
          <div style="
            padding: 12px 16px;
            background: #e0e7ff;
            margin-bottom: 8px;
            border-radius: 18px 18px 4px 18px;
            border-left: 4px solid #6366f1;
            font-size: 14px;
            max-width: 80%;
            margin-left: auto;
            margin-right: 0;
          ">
            <strong>👤 Sie:</strong> ${value}
          </div>
        `;
        chatContainer.appendChild(userBubble);

        // MetaGovernor Bubble-Patch: Clara-Antwort als Bubble
        const claraBubble = document.createElement("div");
        claraBubble.className = "bubble bubble-response chat-response";
        claraBubble.innerHTML = `
          <div style="
            padding: 12px 16px;
            background: #dcfce7;
            margin-bottom: 12px;
            border-radius: 18px 18px 18px 4px;
            border-left: 4px solid #22c55e;
            font-size: 14px;
            max-width: 80%;
            margin-left: 0;
            margin-right: auto;
          ">
            <strong>🤖 Clara:</strong> ${response}
          </div>
        `;
        chatContainer.appendChild(claraBubble);

        console.log("💬 Clara-Antwort:", response);
        console.log("🎯 Matched Intent:", match?.intent || "default");
        console.log("🎨 Bubble-Patch angewendet");

      } catch (err) {
        console.error("❌ Fehler beim Laden der JSON-Datei:", err);
        
        // Fallback-Antwort als Bubble
        const errorBubble = document.createElement("div");
        errorBubble.className = "bubble bubble-error";
        errorBubble.innerHTML = `
          <div style="
            padding: 12px 16px;
            background: #fef3c7;
            margin-bottom: 12px;
            border-radius: 18px 18px 18px 4px;
            border-left: 4px solid #f59e0b;
            font-size: 14px;
            max-width: 80%;
            margin-left: 0;
            margin-right: auto;
          ">
            <strong>🤖 Clara:</strong> Entschuldigung, ich kann momentan nicht auf meine Wissensbasis zugreifen. Versuchen Sie es in einem Moment erneut.
          </div>
        `;
        chatContainer.appendChild(errorBubble);
      }

      // Auto-scroll und Input leeren
      chatContainer.scrollTop = chatContainer.scrollHeight;
      input.value = "";
    };

    console.log("✅ JSON-basierte Bubble-Chat aktiviert!");
    
  } catch (err) {
    console.error("❌ Clara JSON-Engine Fehler:", err);
  }
}, 3000);
