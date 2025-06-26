/**
 * ClaraKIPanel.jsx - v3.1 Modernized AI Assistant Panel
 * Migrated from legacy-clara/panels-archived/ClaraKIPanel.jsx
 * 
 * Features:
 * - React Hooks architecture
 * - Tailwind CSS styling
 * - Atomic Design compliance
 * - Slot-based integration ready
 * - ClaraGlobalContext compatible
 * - GDPR compliant conversation handling
 * - IntentSystem Integration v3.1
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ClaraButton } from '../atoms/ClaraButton';
import IntentBadge from '../molecules/IntentBadge';
import intentProcessor from '../../utils/IntentProcessor';

// Mock AI Provider for development - will be replaced with real Supabase integration
const useClaraAI = () => {
  const [conversations, setConversations] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const askClara = useCallback(async (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    setConversations(prev => [...prev, userMessage]);
    setIsThinking(true);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Process intent using IntentProcessor
    const intentResult = intentProcessor.processIntent(message, { tenantId: 'waldhofstrasse_76' });
    
    let aiResponse = intentResult.response;
    let confidence = intentResult.confidence;
    let detectedIntent = intentResult.intent;

    // If no intent detected, use fallback
    if (!intentResult.success) {
      aiResponse = intentResult.response;
      confidence = 0.1;
      detectedIntent = { id: 'fallback', name: 'Unbekannte Anfrage', category: 'fallback' };
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      text: aiResponse,
      timestamp: new Date().toISOString(),
      confidence: confidence,
      intent: detectedIntent,
      intentResult: intentResult,
      matchedKeywords: intentResult.matchedKeywords || []
    };

    setConversations(prev => [...prev, aiMessage]);
    setIsThinking(false);
  }, []);

  return { conversations, isThinking, askClara };
};

export default function ClaraKIPanel({ 
  tenantId = null,
  initialOpen = false,
  onConversationUpdate = null,
  className = '',
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputValue, setInputValue] = useState('');
  const { conversations, isThinking, askClara } = useClaraAI();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isThinking]);

  // Notify parent component of conversation updates
  useEffect(() => {
    if (onConversationUpdate && conversations.length > 0) {
      onConversationUpdate(conversations);
    }
  }, [conversations, onConversationUpdate]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await askClara(message);
  }, [inputValue, askClara]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`} {...props}>
        <ClaraButton
          onClick={togglePanel}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Clara KI-Chat öffnen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04.97 4.43L1 23l6.57-1.97C9.96 21.64 11.46 22 13 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </ClaraButton>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`} {...props}>
      <div className="w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04.97 4.43L1 23l6.57-1.97C9.96 21.64 11.46 22 13 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Clara KI-Assistent</h3>
              <p className="text-xs text-white/80">Hausverwaltung Support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <ClaraButton
              onClick={togglePanel}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 p-1"
              aria-label="Chat schließen"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </ClaraButton>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {conversations.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04.97 4.43L1 23l6.57-1.97C9.96 21.64 11.46 22 13 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </div>
              <p className="font-medium text-gray-700">Hallo! Ich bin Clara 👋</p>
              <p className="text-sm text-gray-500 mt-1">Fragen Sie mich zu Mieten, Wartungen oder Dokumenten!</p>
            </div>
          )}
          
          {conversations.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white ml-4'
                    : 'bg-white text-gray-800 mr-4 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                
                {/* Intent Badge for assistant messages */}
                {msg.type === 'assistant' && msg.intent && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <IntentBadge
                      intent={msg.intent}
                      confidence={msg.confidence}
                      confidenceLevel={msg.intentResult?.confidenceLevel}
                      size="sm"
                      showConfidence={true}
                    />
                    {msg.matchedKeywords && msg.matchedKeywords.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Keywords: {msg.matchedKeywords.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {msg.confidence && msg.type === 'assistant' && (
                  <div className="text-xs opacity-70 mt-2 flex items-center gap-1">
                    <span>Vertrauen: {Math.round(msg.confidence * 100)}%</span>
                    <div className={`w-2 h-2 rounded-full ${
                      msg.confidence > 0.7 ? 'bg-green-400' : 
                      msg.confidence > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 p-3 rounded-lg mr-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Clara analysiert...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Fragen Sie Clara..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isThinking}
              maxLength={500}
            />
            <ClaraButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isThinking}
              size="sm"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </ClaraButton>
          </div>
          
          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Powered by Clara360 IntentSystem</span>
            <span>{inputValue.length}/500</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ClaraKIPanel };

