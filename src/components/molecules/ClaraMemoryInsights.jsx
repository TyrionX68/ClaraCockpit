import React, { useState, useEffect } from 'react';
import { Brain, Clock, TrendingUp, Users, MessageCircle, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntelligentContextMemory } from '../../hooks/useIntelligentContextMemory';

/**
 * Clara Context Memory Visualization Component
 * Features:
 * - Memory statistics display
 * - Conversation history browser
 * - Topic tracking visualization
 * - User preference insights
 * - Session management
 * - Memory export/import
 */
const ClaraMemoryInsights = ({ 
  showDetails = false,
  showHistory = false,
  showTopics = true,
  showPreferences = false 
}) => {
  const {
    conversationHistory,
    currentSession,
    userPreferences,
    contextTopics,
    memoryStats,
    getRelevantContext,
    generateContextualHints,
    clearMemory,
    exportMemoryData,
    getMemoryStatus
  } = useIntelligentContextMemory();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState({});

  // Update memory status
  useEffect(() => {
    setMemoryStatus(getMemoryStatus());
  }, [conversationHistory, getMemoryStatus]);

  // Format memory size
  const formatMemorySize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format duration
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  // Get topic color
  const getTopicColor = (topic) => {
    const colors = {
      'mieter': 'bg-blue-100 text-blue-800',
      'immobilie': 'bg-green-100 text-green-800',
      'finanzen': 'bg-yellow-100 text-yellow-800',
      'wartung': 'bg-red-100 text-red-800',
      'dokumente': 'bg-purple-100 text-purple-800',
      'analyse': 'bg-indigo-100 text-indigo-800',
      'kommunikation': 'bg-pink-100 text-pink-800'
    };
    return colors[topic] || 'bg-gray-100 text-gray-800';
  };

  // Handle memory export
  const handleExport = () => {
    const data = exportMemoryData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clara-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Search conversations
  const searchConversations = () => {
    if (!searchQuery.trim()) return [];
    return getRelevantContext(searchQuery, 10);
  };

  return (
    <div className="space-y-4">
      {/* Memory Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Gespräche</span>
          </div>
          <div className="text-lg font-bold text-blue-800">
            {memoryStatus.totalEntries || 0}
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Session</span>
          </div>
          <div className="text-lg font-bold text-green-800">
            {memoryStatus.currentSessionLength || 0}
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Themen</span>
          </div>
          <div className="text-lg font-bold text-purple-800">
            {memoryStatus.topicsTracked || 0}
          </div>
        </div>

        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Zufriedenheit</span>
          </div>
          <div className="text-lg font-bold text-orange-800">
            {Math.round(memoryStats.userSatisfactionScore || 0)}%
          </div>
        </div>
      </div>

      {/* Current Session Info */}
      {currentSession && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Aktuelle Session
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDuration(Date.now() - new Date(currentSession.startTime).getTime())}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Interaktionen:</span>
              <span className="ml-2 font-medium">{currentSession.interactions.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Hauptthemen:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {currentSession.topics.slice(0, 3).map(topic => (
                  <span key={topic} className={`px-2 py-1 rounded-full text-xs ${getTopicColor(topic)}`}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Topics */}
      {showTopics && contextTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Häufigste Themen
            </h3>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              size="sm"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {contextTopics.slice(0, showAdvanced ? 12 : 6).map(topic => (
              <div
                key={topic.name}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  selectedTopic === topic.name 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTopicColor(topic.name)}`}>
                    {topic.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {topic.count}x
                  </span>
                </div>
                {showAdvanced && (
                  <div className="mt-1 text-xs text-gray-500">
                    Relevanz: {topic.relevanceScore.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Preferences */}
      {showPreferences && Object.keys(userPreferences).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Ihre Präferenzen
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPreferences.communicationStyle && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  Kommunikationsstil
                </div>
                <div className="text-sm text-blue-800 capitalize">
                  {userPreferences.communicationStyle}
                </div>
              </div>
            )}
            
            {userPreferences.preferredTopics && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 font-medium mb-1">
                  Bevorzugte Themen
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(userPreferences.preferredTopics)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([topic, count]) => (
                      <span key={topic} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        {topic} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & History */}
      {showHistory && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche in Gesprächshistorie..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
            />
            <Button
              onClick={() => setSearchQuery('')}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          </div>
          
          {searchQuery && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchConversations().map(conv => (
                <div key={conv.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      {new Date(conv.timestamp).toLocaleString('de-DE')}
                    </span>
                    <span className="text-xs text-blue-600">
                      Relevanz: {conv.relevanceScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-gray-800">
                    {conv.content.length > 150 
                      ? conv.content.substring(0, 150) + '...' 
                      : conv.content}
                  </div>
                  {conv.topics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {conv.topics.map(topic => (
                        <span key={topic} className={`px-1 py-0.5 rounded text-xs ${getTopicColor(topic)}`}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Memory Management */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          Speicherverbrauch: {formatMemorySize(memoryStatus.memoryUsage || 0)}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Export
          </Button>
          
          <Button
            onClick={() => {
              if (confirm('Möchten Sie wirklich alle Clara-Erinnerungen löschen?')) {
                clearMemory('all');
              }
            }}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && showAdvanced && (
        <details className="text-xs">
          <summary className="text-gray-500 cursor-pointer">
            Debug Information
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-gray-700 overflow-auto max-h-32">
            {JSON.stringify({
              memoryStatus,
              sessionInfo: currentSession ? {
                id: currentSession.id,
                duration: Date.now() - new Date(currentSession.startTime).getTime(),
                interactions: currentSession.interactions.length
              } : null,
              topTopics: contextTopics.slice(0, 5).map(t => ({ name: t.name, count: t.count }))
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ClaraMemoryInsights;

