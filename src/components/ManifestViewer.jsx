import React, { useState, useEffect } from 'react';

export default function ManifestViewer() {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/context_manifest.json')
      .then(response => response.json())
      .then(data => {
        setManifest(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading manifest:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4">Loading manifest...</div>;
  }

  if (!manifest) {
    return <div className="p-4">Error loading manifest</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Clara360 System Manifest</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">System Version</h3>
        <p className="text-gray-600">{manifest.system_version}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Vision</h3>
        <p className="text-gray-600">{manifest.vision}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Active Components</h3>
        <ul className="list-disc list-inside text-gray-600">
          {manifest.active_components?.map((component, index) => (
            <li key={index}>{component}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Deployment Status</h3>
        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          {manifest.governance?.deployment_status || 'Unknown'}
        </span>
      </div>
    </div>
  );
}

