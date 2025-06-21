import React, { useState } from 'react'
import { MessageSquare, Phone, Settings, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * WhatsApp Business Setup Component
 * Vereinfachte Version für Clara360 Mieter-Kommunikation Integration
 * Author: 📛 Manus A | Communication Specialist
 * Date: 2025-06-19
 */
const WhatsAppBusinessSetup = ({ onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [config, setConfig] = useState({
    businessNumber: '+49 151 23456789',
    instanceId: '',
    apiKey: '',
    webhookUrl: 'https://clara360.de/api/whatsapp/webhook'
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    
    // Simuliere WhatsApp Business API Verbindung
    setTimeout(() => {
      setIsConnecting(false)
      setActiveStep(3)
      if (onSuccess) {
        onSuccess({
          connected: true,
          number: config.businessNumber,
          timestamp: new Date().toISOString()
        })
      }
    }, 2000)
  }

  const handleSave = () => {
    // Speichere Konfiguration
    localStorage.setItem('clara360_whatsapp_config', JSON.stringify(config))
    if (onClose) onClose()
  }

  return (
    <div className="whatsapp-setup-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <MessageSquare size={24} />
            WhatsApp Business Setup
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="setup-steps">
          <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Geschäftsnummer konfigurieren</h3>
              <div className="form-group">
                <label>WhatsApp Business Nummer:</label>
                <input
                  type="tel"
                  value={config.businessNumber}
                  onChange={(e) => setConfig({...config, businessNumber: e.target.value})}
                  placeholder="+49 151 23456789"
                />
              </div>
            </div>
          </div>

          <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>API-Konfiguration</h3>
              <div className="form-group">
                <label>Instance ID:</label>
                <input
                  type="text"
                  value={config.instanceId}
                  onChange={(e) => setConfig({...config, instanceId: e.target.value})}
                  placeholder="Ihre WhatsApp Instance ID"
                />
              </div>
              <div className="form-group">
                <label>API Key:</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="Ihr WhatsApp API Key"
                />
              </div>
            </div>
          </div>

          <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Verbindung testen</h3>
              {activeStep === 3 ? (
                <div className="success-message">
                  <CheckCircle size={48} color="#10B981" />
                  <p>WhatsApp Business erfolgreich verbunden!</p>
                  <p>Nummer: {config.businessNumber}</p>
                </div>
              ) : (
                <p>Verbindung wird getestet...</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {activeStep < 3 && (
            <>
              <button 
                className="btn-secondary" 
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
              >
                Zurück
              </button>
              <button 
                className="btn-primary" 
                onClick={activeStep === 2 ? handleConnect : () => setActiveStep(activeStep + 1)}
                disabled={isConnecting}
              >
                {isConnecting ? 'Verbinde...' : activeStep === 2 ? 'Verbinden' : 'Weiter'}
              </button>
            </>
          )}
          {activeStep === 3 && (
            <button className="btn-primary" onClick={handleSave}>
              Setup abschließen
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .whatsapp-setup-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: #25D366;
          font-size: 1.5rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
        }

        .close-button:hover {
          color: #374151;
        }

        .setup-steps {
          margin-bottom: 2rem;
        }

        .step {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .step.active {
          opacity: 1;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #6b7280;
          flex-shrink: 0;
        }

        .step.active .step-number {
          background: #25D366;
          color: white;
        }

        .step-content {
          flex: 1;
        }

        .step-content h3 {
          margin: 0 0 1rem 0;
          color: #374151;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #25D366;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
        }

        .success-message {
          text-align: center;
          padding: 2rem;
        }

        .success-message p {
          margin: 0.5rem 0;
          color: #374151;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #25D366;
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background: #22C55E;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            padding: 1.5rem;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default WhatsAppBusinessSetup

