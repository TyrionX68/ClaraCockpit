import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Bot, ArrowLeft, Send, MessageSquare, Brain, Zap } from 'lucide-react';
import SimpleMicButton from './molecules/SimpleMicButton';

const ClaraKIPanel = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hallo! Ich bin Clara KI, Ihre intelligente Assistentin für die Hausverwaltung. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice-to-Chat Handler
  const handleVoiceTranscript = (transcript) => {
    console.log('[ClaraKIPanel] Voice transcript received:', transcript);
    setInputMessage(transcript);
    
    // Auto-send voice messages
    setTimeout(() => {
      if (transcript.trim()) {
        handleSendMessage();
      }
    }, 500);
  };

  // SSML-Ausgabe via speechSynthesis
  const speak = (text) => {
    // Stoppe vorherige Sprachausgabe
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.pitch = 1.0;
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    
    console.log('[ClaraKIPanel] Starting speech synthesis:', text);
    speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Simuliere KI-Antwort
    setTimeout(() => {
      const aiResponseText = generateAIResponse(currentInput);
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
      // Automatische Sprachausgabe nach Clara-Antwort
      setTimeout(() => {
        speak(aiResponseText);
      }, 500);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const responses = {
      'miete': 'Die aktuelle Mietsituation für Waldhofstraße 76: 14 Einheiten, 100% vermietet, monatliche Einnahmen 8.360€.',
      'rückstände': 'Aktuell gibt es einen Rückstand: Familie Schmidt (1. OG rechts) - 1.200€ für 2 Monate. Soll ich eine Mahnung vorbereiten?',
      'objekt': 'Waldhofstraße 76 ist unser Hauptobjekt mit 14 Einheiten. Vermietungsgrad 100%, Jahresrendite 8.4%.',
      'zahlung': 'Die letzten Zahlungseingänge: Juni 2025 - 8.360€ vollständig eingegangen. Alle Mieter haben pünktlich gezahlt.',
      'wartung': 'Aktuell sind keine Wartungsanfragen offen. Das letzte Update war eine Heizungsreparatur in Wohnung 3.',
      'default': 'Ich kann Ihnen bei Fragen zu Mietern, Objekten, Zahlungen, Rückständen und Wartung helfen. Was möchten Sie wissen?'
    };

    const input = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (input.includes(key)) {
        return response;
      }
    }
    return responses.default;
  };

  const quickActions = [
    { label: 'Mieter-Übersicht', action: () => navigate('/eigentuemer') },
    { label: 'Rückstände prüfen', action: () => navigate('/rueckstaende') },
    { label: 'Zahlungen anzeigen', action: () => navigate('/zahlungen') },
    { label: 'Objekt-Details', action: () => navigate('/objekte') }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <main className="flex-1 p-4 md:p-6 md:ml-16 lg:ml-64">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clara KI</h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Intelligente Assistentin für Hausverwaltung</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat-Bereich */}
          <div className="lg:col-span-2">
            <Card className="h-[500px] md:h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Clara KI Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Nachrichten */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Eingabe */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Fragen Sie Clara KI..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 text-sm md:text-base"
                  />
                  <SimpleMicButton
                    onTranscript={handleVoiceTranscript}
                    autoSend={true}
                    size="default"
                    variant="outline"
                    debugMode={true}
                    showStatus={true}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading} size="default">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seitenleiste */}
          <div className="space-y-6">
            {/* Schnellaktionen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Schnellaktionen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={action.action}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KI-Status */}
            <Card>
              <CardHeader>
                <CardTitle>KI-Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engine</span>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Modell</span>
                    <span className="text-sm font-medium">Clara-GPT-4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Antwortzeit</span>
                    <span className="text-sm font-medium">~1.5s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kontext</span>
                    <span className="text-sm font-medium">Waldhofstraße 76</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Häufige Fragen */}
            <Card>
              <CardHeader>
                <CardTitle>Häufige Fragen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Wie hoch sind die aktuellen Rückstände?',
                    'Welche Wartungen stehen an?',
                    'Wie ist der Vermietungsgrad?',
                    'Wann ist die nächste Zahlung fällig?'
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2 text-sm"
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClaraKIPanel;

