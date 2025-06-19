console.log("🔌 Clara Chat Script geladen");

setTimeout(() => {
  const input = document.querySelector('input[placeholder*="Clara"]');
  const sendBtn = document.querySelector('button.bg-purple-600');

  if (!input || !sendBtn) {
    console.warn("Clara Chat DOM nicht vollständig gefunden", {input: !!input, sendBtn: !!sendBtn});
    return;
  }

  console.log("✅ Clara Chat DOM gefunden - aktiviere Funktionalität");

  sendBtn.onclick = () => {
    const value = input.value.trim();
    if (!value) return;

    console.log("📤 Nachricht gesendet:", value);

    // Chat-Container finden oder erstellen
    let chatContainer = document.querySelector('.clara-chat-messages');
    if (!chatContainer) {
      // Container im Chat-Bereich erstellen
      const chatArea = document.querySelector('[class*="chat"]') || 
                      document.querySelector('.clara-ki-chat') ||
                      input.parentElement.parentElement;
      
      chatContainer = document.createElement("div");
      chatContainer.className = "clara-chat-messages";
      chatContainer.style.cssText = `
        margin-top: 16px;
        max-height: 300px;
        overflow-y: auto;
        padding: 8px;
      `;
      chatArea.appendChild(chatContainer);
    }

    const bubble = document.createElement("div");
    bubble.textContent = "Clara antwortet: " + mockClaraResponse(value);
    bubble.style.cssText = `
      padding: 12px;
      background: #f0f0f0;
      margin-top: 8px;
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
      font-size: 14px;
      line-height: 1.4;
    `;
    
    chatContainer.appendChild(bubble);
    input.value = "";
    
    console.log("💬 Antwort-Bubble erstellt");
  };
}, 2500);

function mockClaraResponse(text) {
  if (text.toLowerCase().includes("miete")) return "Deine Mieteinnahmen betragen 8.760€ im Juni.";
  if (text.toLowerCase().includes("rückstand")) return "1 Mieter hat 1.200 € Rückstand.";
  return "Ich prüfe das für dich.";
}
