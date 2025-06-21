import React from 'react';
import ClaraChatEngine from './ClaraChatEngine';

/**
 * ClaraChatBubbleSlot.jsx
 * Modulare Slot-Integration für Clara KI 2.0 Chat
 * Respektiert Clara360 Grid-System und Sidebar-Architektur
 * 
 * Created by Manus A - Modulare Korrektur
 */
export default function ClaraChatBubbleSlot() {
  return (
    <div className="clara-kpi-card">
      <div className="card-header">
        <h2 className="card-title">🤖 Clara KI-Chat</h2>
        <p className="card-subtitle">Intelligenter Assistent mit Gesprächs-Gedächtnis</p>
      </div>
      <div className="card-content">
        <ClaraChatEngine />
      </div>

      <style jsx>{`
        .clara-kpi-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .card-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .card-subtitle {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          color: #666;
        }

        .card-content {
          flex: 1;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Responsive Grid Integration */
        @media (min-width: 768px) {
          .clara-kpi-card {
            min-height: 500px;
          }
        }

        @media (min-width: 1024px) {
          .clara-kpi-card {
            min-height: 600px;
          }
        }
      `}</style>
    </div>
  );
}

