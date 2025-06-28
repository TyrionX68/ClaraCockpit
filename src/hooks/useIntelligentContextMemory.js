import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Intelligent Context Memory & Session Management Hook
 * Features:
 * - Long-term conversation memory
 * - Session persistence across browser refreshes
 * - Context-aware response generation
 * - User preference learning
 * - Topic tracking and continuation
 * - Intelligent information retrieval
 */
export const useIntelligentContextMemory = () => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const [contextTopics, setContextTopics] = useState([]);
  const [activeContext, setActiveContext] = useState({});
  const [memoryStats, setMemoryStats] = useState({
    totalConversations: 0,
    averageSessionLength: 0,
    mostDiscussedTopics: [],
    userSatisfactionScore: 0
  });

  const sessionRef = useRef(null);
  const memoryStorageKey = 'clara_context_memory';
  const preferencesStorageKey = 'clara_user_preferences';
  const maxHistoryLength = 1000; // Maximum conversation entries to keep

  // Initialize memory system
  useEffect(() => {
    loadMemoryFromStorage();
    initializeSession();
    
    // Save memory periodically
    const saveInterval = setInterval(saveMemoryToStorage, 30000); // Every 30 seconds
    
    // Save on page unload
    const handleBeforeUnload = () => {
      saveMemoryToStorage();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveMemoryToStorage();
    };
  }, []);

  // Load memory from localStorage
  const loadMemoryFromStorage = useCallback(() => {
    try {
      const savedMemory = localStorage.getItem(memoryStorageKey);
      const savedPreferences = localStorage.getItem(preferencesStorageKey);
      
      if (savedMemory) {
        const memory = JSON.parse(savedMemory);
        setConversationHistory(memory.conversations || []);
        setContextTopics(memory.topics || []);
        setMemoryStats(memory.stats || {
          totalConversations: 0,
          averageSessionLength: 0,
          mostDiscussedTopics: [],
          userSatisfactionScore: 0
        });
      }
      
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
      
      console.log('🧠 Clara Memory loaded from storage');
    } catch (error) {
      console.error('🚨 Failed to load Clara memory:', error);
    }
  }, []);

  // Save memory to localStorage
  const saveMemoryToStorage = useCallback(() => {
    try {
      const memoryData = {
        conversations: conversationHistory.slice(-maxHistoryLength),
        topics: contextTopics,
        stats: memoryStats,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(memoryStorageKey, JSON.stringify(memoryData));
      localStorage.setItem(preferencesStorageKey, JSON.stringify(userPreferences));
      
      console.log('🧠 Clara Memory saved to storage');
    } catch (error) {
      console.error('🚨 Failed to save Clara memory:', error);
    }
  }, [conversationHistory, contextTopics, memoryStats, userPreferences]);

  // Initialize new session
  const initializeSession = useCallback(() => {
    const session = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      interactions: [],
      topics: [],
      userSatisfaction: null,
      context: {}
    };
    
    setCurrentSession(session);
    sessionRef.current = session;
    
    console.log('🧠 New Clara session initialized:', session.id);
  }, []);

  // Add conversation entry
  const addConversationEntry = useCallback((entry) => {
    const conversationEntry = {
      id: `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
      sessionId: currentSession?.id,
      type: entry.type, // 'user' | 'assistant' | 'system'
      content: entry.content,
      context: entry.context || {},
      topics: extractTopics(entry.content),
      sentiment: analyzeSentiment(entry.content),
      confidence: entry.confidence || 1.0,
      metadata: entry.metadata || {}
    };
    
    setConversationHistory(prev => {
      const updated = [...prev, conversationEntry];
      return updated.slice(-maxHistoryLength); // Keep only recent entries
    });
    
    // Update current session
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        interactions: [...currentSession.interactions, conversationEntry],
        topics: [...new Set([...currentSession.topics, ...conversationEntry.topics])],
        lastActivity: new Date().toISOString()
      };
      
      setCurrentSession(updatedSession);
      sessionRef.current = updatedSession;
    }
    
    // Update context topics
    updateContextTopics(conversationEntry.topics);
    
    // Learn user preferences
    learnUserPreferences(conversationEntry);
    
    return conversationEntry;
  }, [currentSession]);

  // Extract topics from text
  const extractTopics = useCallback((text) => {
    const topics = [];
    const lowerText = text.toLowerCase();
    
    // Real estate topics
    const realEstateTopics = {
      'mieter': ['mieter', 'mieterin', 'mieterschaft', 'tenant'],
      'immobilie': ['immobilie', 'objekt', 'gebäude', 'property'],
      'miete': ['miete', 'mieteinnahmen', 'rent', 'rental'],
      'wartung': ['wartung', 'reparatur', 'instandhaltung', 'maintenance'],
      'finanzen': ['finanzen', 'kosten', 'einnahmen', 'rendite', 'cashflow'],
      'vertrag': ['vertrag', 'mietvertrag', 'contract', 'agreement'],
      'dokumente': ['dokument', 'unterlagen', 'papiere', 'documents'],
      'analyse': ['analyse', 'auswertung', 'statistik', 'analytics'],
      'kommunikation': ['nachricht', 'email', 'anruf', 'communication'],
      'terminplanung': ['termin', 'appointment', 'calendar', 'schedule']
    };
    
    Object.entries(realEstateTopics).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }, []);

  // Analyze sentiment of text
  const analyzeSentiment = useCallback((text) => {
    const positiveWords = ['gut', 'super', 'toll', 'perfekt', 'danke', 'gerne', 'freue'];
    const negativeWords = ['schlecht', 'problem', 'fehler', 'ärger', 'schwierig', 'nicht'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }, []);

  // Update context topics
  const updateContextTopics = useCallback((newTopics) => {
    setContextTopics(prev => {
      const topicMap = new Map();
      
      // Add existing topics
      prev.forEach(topic => {
        topicMap.set(topic.name, {
          ...topic,
          lastMentioned: topic.lastMentioned
        });
      });
      
      // Add/update new topics
      newTopics.forEach(topicName => {
        const existing = topicMap.get(topicName);
        topicMap.set(topicName, {
          name: topicName,
          count: (existing?.count || 0) + 1,
          firstMentioned: existing?.firstMentioned || new Date().toISOString(),
          lastMentioned: new Date().toISOString(),
          relevanceScore: calculateTopicRelevance(topicName, prev)
        });
      });
      
      return Array.from(topicMap.values())
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 50); // Keep top 50 topics
    });
  }, []);

  // Calculate topic relevance
  const calculateTopicRelevance = useCallback((topicName, existingTopics) => {
    const existing = existingTopics.find(t => t.name === topicName);
    const baseScore = existing ? existing.count : 1;
    const recencyBonus = 1.0; // Recent mentions get bonus
    const frequencyBonus = Math.log(baseScore + 1);
    
    return baseScore * recencyBonus + frequencyBonus;
  }, []);

  // Learn user preferences
  const learnUserPreferences = useCallback((entry) => {
    if (entry.type === 'user') {
      const preferences = { ...userPreferences };
      
      // Learn communication style
      if (entry.content.length < 20) {
        preferences.communicationStyle = 'brief';
      } else if (entry.content.length > 100) {
        preferences.communicationStyle = 'detailed';
      }
      
      // Learn preferred topics
      entry.topics.forEach(topic => {
        preferences.preferredTopics = preferences.preferredTopics || {};
        preferences.preferredTopics[topic] = (preferences.preferredTopics[topic] || 0) + 1;
      });
      
      // Learn time patterns
      const hour = new Date().getHours();
      preferences.activeHours = preferences.activeHours || {};
      preferences.activeHours[hour] = (preferences.activeHours[hour] || 0) + 1;
      
      setUserPreferences(preferences);
    }
  }, [userPreferences]);

  // Get relevant context for current conversation
  const getRelevantContext = useCallback((query, maxResults = 5) => {
    const queryTopics = extractTopics(query);
    const queryLower = query.toLowerCase();
    
    // Score conversations by relevance
    const scoredConversations = conversationHistory
      .filter(conv => conv.type === 'assistant') // Only Clara's responses
      .map(conv => {
        let score = 0;
        
        // Topic overlap
        const topicOverlap = conv.topics.filter(topic => queryTopics.includes(topic)).length;
        score += topicOverlap * 3;
        
        // Content similarity (simple keyword matching)
        const contentWords = conv.content.toLowerCase().split(' ');
        const queryWords = queryLower.split(' ');
        const wordOverlap = contentWords.filter(word => queryWords.includes(word)).length;
        score += wordOverlap;
        
        // Recency bonus
        const daysSince = (Date.now() - new Date(conv.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 7 - daysSince); // Bonus for recent conversations
        
        // Session continuity bonus
        if (conv.sessionId === currentSession?.id) {
          score += 2;
        }
        
        return { ...conv, relevanceScore: score };
      })
      .filter(conv => conv.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    
    return scoredConversations;
  }, [conversationHistory, currentSession, extractTopics]);

  // Generate contextual response hints
  const generateContextualHints = useCallback((query) => {
    const relevantContext = getRelevantContext(query);
    const queryTopics = extractTopics(query);
    
    const hints = {
      previousDiscussions: relevantContext.map(conv => ({
        content: conv.content.substring(0, 100) + '...',
        timestamp: conv.timestamp,
        topics: conv.topics
      })),
      
      relatedTopics: contextTopics
        .filter(topic => queryTopics.some(qt => topic.name.includes(qt) || qt.includes(topic.name)))
        .slice(0, 5),
      
      userPreferences: {
        communicationStyle: userPreferences.communicationStyle || 'balanced',
        preferredTopics: Object.entries(userPreferences.preferredTopics || {})
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([topic]) => topic)
      },
      
      sessionContext: currentSession ? {
        duration: Date.now() - new Date(currentSession.startTime).getTime(),
        interactionCount: currentSession.interactions.length,
        mainTopics: currentSession.topics.slice(0, 3)
      } : null
    };
    
    return hints;
  }, [getRelevantContext, extractTopics, contextTopics, userPreferences, currentSession]);

  // Update memory stats
  const updateMemoryStats = useCallback(() => {
    const stats = {
      totalConversations: conversationHistory.length,
      averageSessionLength: conversationHistory.length > 0 
        ? conversationHistory.reduce((sum, conv) => sum + conv.content.length, 0) / conversationHistory.length 
        : 0,
      mostDiscussedTopics: contextTopics
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(topic => ({ name: topic.name, count: topic.count })),
      userSatisfactionScore: calculateSatisfactionScore()
    };
    
    setMemoryStats(stats);
  }, [conversationHistory, contextTopics]);

  // Calculate user satisfaction score
  const calculateSatisfactionScore = useCallback(() => {
    const recentConversations = conversationHistory.slice(-20);
    const positiveCount = recentConversations.filter(conv => conv.sentiment === 'positive').length;
    const totalCount = recentConversations.length;
    
    return totalCount > 0 ? (positiveCount / totalCount) * 100 : 0;
  }, [conversationHistory]);

  // Clear memory (with confirmation)
  const clearMemory = useCallback((type = 'all') => {
    switch (type) {
      case 'session':
        initializeSession();
        break;
      case 'history':
        setConversationHistory([]);
        break;
      case 'preferences':
        setUserPreferences({});
        break;
      case 'all':
        setConversationHistory([]);
        setUserPreferences({});
        setContextTopics([]);
        initializeSession();
        localStorage.removeItem(memoryStorageKey);
        localStorage.removeItem(preferencesStorageKey);
        break;
    }
    
    console.log(`🧠 Clara memory cleared: ${type}`);
  }, [initializeSession]);

  // Export memory data
  const exportMemoryData = useCallback(() => {
    const exportData = {
      conversations: conversationHistory,
      preferences: userPreferences,
      topics: contextTopics,
      stats: memoryStats,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [conversationHistory, userPreferences, contextTopics, memoryStats]);

  // Update stats periodically
  useEffect(() => {
    updateMemoryStats();
  }, [conversationHistory, contextTopics, updateMemoryStats]);

  return {
    // State
    conversationHistory,
    currentSession,
    userPreferences,
    contextTopics,
    activeContext,
    memoryStats,
    
    // Actions
    addConversationEntry,
    getRelevantContext,
    generateContextualHints,
    clearMemory,
    
    // Session management
    initializeSession,
    
    // Data management
    saveMemoryToStorage,
    loadMemoryFromStorage,
    exportMemoryData,
    
    // Utilities
    extractTopics,
    analyzeSentiment,
    
    // Status
    getMemoryStatus: () => ({
      totalEntries: conversationHistory.length,
      currentSessionLength: currentSession?.interactions.length || 0,
      topicsTracked: contextTopics.length,
      memoryUsage: JSON.stringify({ conversationHistory, userPreferences, contextTopics }).length
    })
  };
};

