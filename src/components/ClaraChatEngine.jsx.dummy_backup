import React, { useState, useRef, useEffect } from 'react';

export default function ClaraChatEngine() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'clara',
      text: 'Hallo! Ich bin Clara, Ihr KI-Assistent für die Hausverwaltung. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate Clara response
    setTimeout(() => {
      const claraResponse = {
        id: Date.now() + 1,
        type: 'clara',
        text: 'Vielen Dank für Ihre Nachricht! Ich arbeite daran, Ihnen zu helfen. Diese Funktion wird bald vollständig aktiviert.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, claraResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="clara-chat-engine">
      <div className="chat-header">
        <h2>Clara KI-Assistent</h2>
        <p>Intelligente Unterstützung für Ihre Hausverwaltung</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message clara loading">
            <div className="message-content">
              <p>Clara denkt nach...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Fragen Sie Clara..."
          rows={2}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="send-button"
        >
          Senden
        </button>
      </div>

      <style jsx>{`
        .clara-chat-engine {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          text-align: center;
        }

        .chat-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .chat-header p {
          margin: 0;
          opacity: 0.9;
        }

        .chat-messages {
          height: 400px;
          overflow-y: auto;
          padding: 1rem;
          background: #f8f9fa;
        }

        .message {
          margin-bottom: 1rem;
          display: flex;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.clara {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          position: relative;
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
        }

        .message.clara .message-content {
          background: white;
          border: 1px solid #e9ecef;
        }

        .message.loading .message-content {
          background: #f8f9fa;
          font-style: italic;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          display: block;
          margin-top: 0.25rem;
        }

        .chat-input {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 0.75rem;
        }

        .chat-input textarea {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.75rem;
          resize: none;
          font-family: inherit;
        }

        .chat-input textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-button {
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        .send-button:hover:not(:disabled) {
          background: #5a6fd8;
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
