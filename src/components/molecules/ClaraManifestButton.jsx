import React, { useState } from 'react';
import { FileText, X, ExternalLink } from 'lucide-react';

const ClaraManifestButton = ({ className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manifestData, setManifestData] = useState(null);

  const loadManifest = async () => {
    try {
      const response = await fetch('/src/clara360_manifest.json');
      const data = await response.json();
      setManifestData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to load manifest:', error);
      setManifestData({
        system_version: "ClaraSuite_v4.4.1_Consolidated",
        error: "Could not load full manifest data"
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setManifestData(null);
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'live':
      case 'deployed':
        return 'text-green-600 dark:text-green-400';
      case 'in_development':
      case 'in_migration':
      case 'pending':
        return 'text-orange-600 dark:text-orange-400';
      case 'planned':
      case 'placeholder':
        return 'text-gray-600 dark:text-gray-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <>
      <button
        onClick={loadManifest}
        className={`
          flex items-center space-x-2 px-3 py-2 
          bg-blue-50 dark:bg-blue-900/20 
          border border-blue-200 dark:border-blue-800
          rounded-lg text-sm font-medium
          text-blue-700 dark:text-blue-300
          hover:bg-blue-100 dark:hover:bg-blue-900/30
          hover:border-blue-300 dark:hover:border-blue-700
          transition-all duration-200
          ${className}
        `}
        title="Clara360 System Manifest anzeigen"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">System Manifest</span>
        <span className="sm:hidden">Manifest</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Clara360 System Manifest
                  </h2>
                  {manifestData && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Version: {manifestData.system_version} • 
                      Updated: {manifestData.last_updated ? new Date(manifestData.last_updated).toLocaleString('de-DE') : 'Unknown'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="https://github.com/TyrionX68/ClaraCockpit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="GitHub Repository öffnen"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {manifestData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">System Info</h3>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600 dark:text-gray-400">Version:</span> {manifestData.system_version}</div>
                        <div><span className="text-gray-600 dark:text-gray-400">Branch:</span> {manifestData.active_branch}</div>
                        <div><span className="text-gray-600 dark:text-gray-400">Status:</span> 
                          <span className={getStatusColor(manifestData.deployment?.status)}> {manifestData.deployment?.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Development</h3>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600 dark:text-gray-400">Phase:</span> {manifestData.development_status?.current_phase}</div>
                        <div><span className="text-gray-600 dark:text-gray-400">Progress:</span> {manifestData.development_status?.completion_percentage}%</div>
                        <div><span className="text-gray-600 dark:text-gray-400">Updated by:</span> {manifestData.updated_by}</div>
                      </div>
                    </div>
                  </div>

                  {manifestData.slot_structure && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Active Slots</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(manifestData.slot_structure).map(([key, slot]) => (
                          <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{key}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(slot.status)} bg-current bg-opacity-10`}>
                                {slot.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {slot.component}
                            </div>
                            {slot.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {slot.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <details className="bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      Raw Manifest Data (JSON)
                    </summary>
                    <div className="p-4 pt-0">
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                        {formatJson(manifestData)}
                      </pre>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading manifest data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClaraManifestButton;
