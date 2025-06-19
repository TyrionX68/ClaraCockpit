console.log("🔌 Clara Chat Script geladen");

window.addEventListener("load", () => {
  setTimeout(() => {
    try {
      // MetaGovernor-optimierte DOM-Selektoren
      const input = document.querySelector('input[placeholder*="Clara"], input[placeholder*="Fragen"]');
      const sendBtn = [...document.querySelectorAll("button")].find(btn =>
        btn.textContent.trim().toLowerCase().includes("senden")
      );

      if (!input || !sendBtn) {
        console.warn("❌ Eingabefeld oder Button nicht gefunden");
        console.log("🔍 Verfügbare Inputs:", document.querySelectorAll("input"));
        console.log("🔍 Verfügbare Buttons:", [...document.querySelectorAll("button")].map(b => b.textContent));
        return;
      }

      console.log("✅ Eingabefeld gefunden:", input.placeholder);
      console.log("✅ Button gefunden:", sendBtn.textContent);

      // Chat-Container mit verbesserter Logik
      let chatContainer = document.querySelector('.clara-chat-messages');
      const chatArea = document.querySelector('[class*="chat"]') || 
                      document.querySelector('.clara-ki-chat') || 
                      input?.parentElement?.parentElement;

      if (!chatContainer && chatArea) {
        chatContainer = document.createElement("div");
        chatContainer.className = "clara-chat-messages";
        chatContainer.style.cssText = `
          margin-top: 16px; 
          max-height: 300px; 
          overflow-y: auto; 
          font-size: 14px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        `;
        chatArea.appendChild(chatContainer);
        console.log("📦 Chat-Container erstellt");
      }

      // JSON-basierte Antwort-Engine
      let claraResponses = null;
      
      // Lade JSON-Antworten
      fetch('/system/clara_responses.json')
        .then(response => response.json())
        .then(data => {
          claraResponses = data.responses;
          console.log("📚 Clara JSON-Engine geladen:", Object.keys(claraResponses).length, "Antworten");
        })
        .catch(err => {
          console.warn("⚠️ JSON-Engine nicht verfügbar, verwende Fallback");
          claraResponses = {
            default: { answer: "Ich prüfe das für dich...", confidence: 0.5 }
          };
        });

      // Event-Handler mit JSON-Engine
      sendBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const value = input.value.trim();
        if (!value) return;

        console.log("📤 Nachricht gesendet:", value);

        // User-Nachricht anzeigen
        const userMsg = document.createElement("div");
        userMsg.innerHTML = `<strong>👤 Sie:</strong> ${value}`;
        userMsg.style.cssText = `
          padding: 8px 12px;
          background: #e0e7ff;
          margin-bottom: 8px;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        `;
        chatContainer.appendChild(userMsg);

        // Clara-Antwort generieren
        const response = await getClaraResponse(value, claraResponses);
        
        const claraMsg = document.createElement("div");
        claraMsg.innerHTML = `<strong>🤖 Clara:</strong> ${response.answer}`;
        claraMsg.style.cssText = `
          padding: 8px 12px;
          background: #dcfce7;
          margin-bottom: 12px;
          border-radius: 8px;
          border-left: 4px solid #22c55e;
        `;
        chatContainer.appendChild(claraMsg);

        // Auto-scroll
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        input.value = "";
        console.log("💬 Clara-Antwort:", response.answer, `(Konfidenz: ${response.confidence})`);
      };

      console.log("✅ JSON-basierte Chatfunktion aktiviert!");
    } catch (err) {
      console.error("❌ Scriptfehler:", err);
    }
  }, 5000);
});

// JSON-basierte Antwort-Engine
async function getClaraResponse(userInput, responses) {
  if (!responses) {
    return { answer: "Ich lade gerade meine Wissensbasis...", confidence: 0.3 };
  }

  const input = userInput.toLowerCase();
  let bestMatch = responses.default;
  let highestScore = 0;

  // Keyword-Matching mit Scoring
  for (const [key, response] of Object.entries(responses)) {
    if (key === 'default') continue;
    
    const score = response.keywords.reduce((acc, keyword) => {
      return input.includes(keyword.toLowerCase()) ? acc + 1 : acc;
    }, 0);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = response;
    }
  }

  return {
    answer: bestMatch.answer,
    confidence: bestMatch.confidence,
    matched_keywords: highestScore
  };
}
