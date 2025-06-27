import React, { useState } from 'react';
import BottomNavigation from '../components/molecules/BottomNavigation';

const KommunikationPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Familie Schmidt',
      time: '10:30',
      content: 'Guten Tag, die Heizung in Wohnung 3A funktioniert nicht richtig.',
      type: 'received'
    },
    {
      id: 2,
      sender: 'Verwaltung',
      time: '11:15',
      content: 'Vielen Dank für die Meldung. Wir werden einen Techniker beauftragen.',
      type: 'sent'
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'Verwaltung',
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        content: message,
        type: 'sent'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center">
          💬 Mieter-Kommunikation
        </h1>
        <p className="text-slate-300 mt-2">Nachrichten und Anfragen der Mieter</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.type === 'sent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm">{msg.sender}</span>
                  <span className="text-xs opacity-70 ml-2">{msg.time}</span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Nachricht eingeben..."
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Senden
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default KommunikationPage;
