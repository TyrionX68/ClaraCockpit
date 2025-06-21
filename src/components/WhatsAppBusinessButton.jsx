import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'

/**
 * WhatsApp Business Button für Mieter-Kommunikation
 * Anbindung an bestehende ClaraWhatsAppIntegration-Klasse
 * Author: 📛 Manus A | Communication Specialist
 * Date: 2025-06-19
 */
const WhatsAppBusinessButton = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedContact, setSelectedContact] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Prüfe WhatsApp-Integration beim Laden
  React.useEffect(() => {
    if (window.ClaraWhatsAppIntegration) {
      setIsConnected(true)
    }
  }, [])

  const handleSendMessage = async () => {
    if (!selectedTemplate || !selectedContact) {
      alert('Bitte Template und Empfänger auswählen')
      return
    }

    try {
      // Nutze bestehende ClaraWhatsAppIntegration
      const result = await window.ClaraWhatsAppIntegration.sendMessage(
        selectedContact, 
        selectedTemplate,
        {
          tenant_name: 'Echter Mieter',
          property: 'Waldhofstraße 76',
          amount: '1200',
          days: '30'
        }
      )
      
      alert(`WhatsApp-Nachricht gesendet an: ${result.contact}`)
      setShowModal(false)
    } catch (error) {
      alert('Fehler beim Senden: ' + error.message)
    }
  }

  const availableTemplates = [
    { id: 'rent_reminder', name: 'Mietmahnung' },
    { id: 'maintenance_notice', name: 'Wartungsankündigung' },
    { id: 'rent_increase', name: 'Mieterhöhung' },
    { id: 'welcome_tenant', name: 'Willkommen neuer Mieter' },
    { id: 'inspection_notice', name: 'Besichtigungsankündigung' }
  ]

  const availableContacts = [
    { id: 'tenant_1', name: 'Echter Mieter (1. OG rechts)' },
    { id: 'tenant_2', name: 'Mieter (EG links)' },
    { id: 'tenant_3', name: 'Frau Weber (2. OG links)' }
  ]

  return (
    <>
      <button 
        className={`whatsapp-business-btn ${isConnected ? 'connected' : ''}`}
        onClick={() => setShowModal(true)}
        title="WhatsApp Business Nachricht senden"
      >
        <MessageSquare size={18} />
        <span>WhatsApp</span>
        {isConnected && <div className="status-indicator"></div>}
      </button>

      {showModal && (
        <div className="whatsapp-modal">
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>WhatsApp Business Nachricht</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nachrichtenvorlage:</label>
                <select 
                  value={selectedTemplate} 
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Template auswählen...</option>
                  {availableTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Empfänger:</label>
                <select 
                  value={selectedContact} 
                  onChange={(e) => setSelectedContact(e.target.value)}
                >
                  <option value="">Mieter auswählen...</option>
                  {availableContacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Abbrechen</button>
              <button onClick={handleSendMessage} className="btn-primary">
                WhatsApp öffnen
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .whatsapp-business-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #25D366;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .whatsapp-business-btn:hover {
          background: #22C55E;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .whatsapp-business-btn.connected {
          background: #059669;
        }

        .status-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
        }

        .whatsapp-modal {
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
          padding: 1.5rem;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #25D366;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
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

        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .modal-actions button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #d1d5db;
          background: #f3f4f6;
          color: #374151;
        }

        .btn-primary {
          background: #25D366 !important;
          color: white !important;
          border-color: #25D366 !important;
        }

        .btn-primary:hover {
          background: #22C55E !important;
        }

        @media (max-width: 768px) {
          .whatsapp-business-btn span {
            display: none;
          }
          
          .modal-content {
            margin: 1rem;
            padding: 1rem;
          }
        }
      `}</style>
    </>
  )
}

export default WhatsAppBusinessButton

