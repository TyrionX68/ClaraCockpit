import React, { useState, useEffect } from 'react';
import BottomNavigation from '../components/molecules/BottomNavigation';

const ManifestPage = () => {
  const [manifest, setManifest] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Load manifest data
    import('../clara360_manifest.json')
      .then(data => setManifest(data.default || data))
      .catch(err => console.error('Manifest loading error:', err));
  }, []);

  if (!manifest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Lade Manifest...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', name: 'Übersicht', icon: '📋' },
    { id: 'vision', name: 'Vision', icon: '🎯' },
    { id: 'architecture', name: 'Architektur', icon: '🏗️' },
    { id: 'slots', name: 'Slots', icon: '🧩' },
    { id: 'components', name: 'Komponenten', icon: '⚙️' },
    { id: 'deployment', name: 'Deployment', icon: '🚀' },
    { id: 'compliance', name: 'DSGVO', icon: '🔒' },
    { id: 'roadmap', name: 'Roadmap', icon: '🗺️' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">
          {manifest.manifest.name} v{manifest.manifest.version}
        </h2>
        <p className="text-slate-300 mb-4">{manifest.manifest.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{manifest.manifest.status}</div>
            <div className="text-sm text-slate-400">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{Object.keys(manifest.slots).length}</div>
            <div className="text-sm text-slate-400">Aktive Slots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {manifest.components.organisms.length + manifest.components.molecules.length + manifest.components.atoms.length}
            </div>
            <div className="text-sm text-slate-400">Komponenten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {new Date(manifest.manifest.timestamp).toLocaleDateString('de-DE')}
            </div>
            <div className="text-sm text-slate-400">Letztes Update</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVision = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Mission</h3>
        <p className="text-slate-300 mb-6">{manifest.vision.mission}</p>
        
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Ziele</h3>
        <ul className="space-y-2 mb-6">
          {manifest.vision.goals.map((goal, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span className="text-slate-300">{goal}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-bold text-yellow-400 mb-4">Zielgruppen</h3>
        <div className="grid grid-cols-2 gap-4">
          {manifest.vision.target_users.map((user, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-3">
              <span className="text-slate-300">{user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Frontend</h3>
          <div className="space-y-3">
            {Object.entries(manifest.architecture.frontend).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
                <span className="text-slate-300">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Backend</h3>
          <div className="space-y-3">
            {Object.entries(manifest.architecture.backend).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
                <span className="text-slate-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Integrationen</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(manifest.architecture.integrations).map(([key, value]) => (
            <div key={key} className="bg-slate-700 rounded-lg p-3">
              <div className="font-semibold text-slate-200 capitalize">{key}</div>
              <div className="text-sm text-slate-400">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSlots = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Object.entries(manifest.slots).map(([key, slot]) => (
          <div key={key} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-400">{slot.component}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                slot.status === 'active' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
              }`}>
                {slot.status}
              </span>
            </div>
            <p className="text-slate-400 mb-3">Route: <span className="text-blue-400">{slot.route}</span></p>
            <div className="flex flex-wrap gap-2">
              {slot.features.map((feature, index) => (
                <span key={index} className="bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-300">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComponents = () => (
    <div className="space-y-6">
      {Object.entries(manifest.components).map(([type, components]) => (
        <div key={type} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 capitalize">{type}</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {components.map((component, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-3 text-center">
                <span className="text-slate-300">{component}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDeployment = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Deployment Info</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Production URL:</span>
            <a href={manifest.deployment.production_url} target="_blank" rel="noopener noreferrer" 
               className="text-blue-400 hover:text-blue-300">
              {manifest.deployment.production_url}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GitHub Repo:</span>
            <span className="text-slate-300">{manifest.deployment.github_repo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Branch:</span>
            <span className="text-slate-300">{manifest.deployment.branch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Auto Deploy:</span>
            <span className={manifest.deployment.auto_deploy ? 'text-green-400' : 'text-red-400'}>
              {manifest.deployment.auto_deploy ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Letztes Deployment:</span>
            <span className="text-slate-300">
              {new Date(manifest.deployment.last_deploy).toLocaleString('de-DE')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">DSGVO Compliance</h3>
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            manifest.compliance.dsgvo.status === 'compliant' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {manifest.compliance.dsgvo.status === 'compliant' ? 'DSGVO-konform' : 'Nicht konform'}
          </span>
        </div>
        <h4 className="font-semibold text-slate-200 mb-3">Maßnahmen:</h4>
        <ul className="space-y-2 mb-6">
          {manifest.compliance.dsgvo.measures.map((measure, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span className="text-slate-300">{measure}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-bold text-yellow-400 mb-4">Sicherheit</h3>
        <div className="space-y-3">
          {Object.entries(manifest.compliance.security).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
              <span className="text-slate-300">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoadmap = () => (
    <div className="space-y-6">
      {Object.entries(manifest.roadmap).map(([version, features]) => (
        <div key={version} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">{version}</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span className="text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'vision': return renderVision();
      case 'architecture': return renderArchitecture();
      case 'slots': return renderSlots();
      case 'components': return renderComponents();
      case 'deployment': return renderDeployment();
      case 'compliance': return renderCompliance();
      case 'roadmap': return renderRoadmap();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">📋 System Manifest</h1>
        <p className="text-slate-300 mt-2">Clara360 v3.1 - Vollständige Systemdokumentation</p>
      </div>

      {/* Navigation */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {section.icon} {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-24">
        {renderSection()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ManifestPage;

