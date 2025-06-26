import React, { useState, useEffect } from 'react';
import ClaraButton from '../atoms/ClaraButton';
import { cn } from '../../lib/utils';

/**
 * ClaraMahnungPanel - Dunning Management Panel
 * Created: 2025-06-26_16-49-51
 * 
 * Second v3.0 Organism Component for tenant payment reminders
 * 
 * @param {Object} props
 * @param {string} props.tenantId - tenant identifier
 * @param {number} props.dueAmount - outstanding amount
 * @param {string} props.lastPaymentDate - last payment date
 * @param {number} props.status - dunning level (1-3)
 * @param {string} props.tenantName - tenant name for display
 * @param {function} props.onEscalate - callback for escalation
 * @param {function} props.onGeneratePDF - callback for PDF generation
 */
const ClaraMahnungPanel = ({ 
  tenantId,
  dueAmount = 0,
  lastPaymentDate,
  status = 1,
  tenantName = 'Unbekannter Mieter',
  onEscalate,
  onGeneratePDF,
  className,
  ...props 
}) => {
  const [internalNotes, setInternalNotes] = useState('');
  const [escalationWarning, setEscalationWarning] = useState(false);

  // Dunning level configuration
  const dunningLevels = {
    1: {
      title: '1. Mahnung',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: '⚠️',
      description: 'Freundliche Zahlungserinnerung'
    },
    2: {
      title: '2. Mahnung',
      color: 'orange', 
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      icon: '🔔',
      description: 'Dringende Zahlungsaufforderung'
    },
    3: {
      title: '3. Mahnung',
      color: 'red',
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: '🚨',
      description: 'Letzte Mahnung vor Inkasso'
    }
  };

  const currentLevel = dunningLevels[status] || dunningLevels[1];

  useEffect(() => {
    // Show escalation warning for level 3
    if (status === 3) {
      setEscalationWarning(true);
    }
  }, [status]);

  const handleEscalate = () => {
    if (onEscalate) {
      onEscalate(tenantId, status + 1);
    }
  };

  const handleGeneratePDF = () => {
    if (onGeneratePDF) {
      onGeneratePDF(tenantId, status);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getDaysSincePayment = () => {
    const lastPayment = new Date(lastPaymentDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastPayment);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Panel Header */}
      <div className={cn(
        'p-6 rounded-lg border-2',
        currentLevel.bgColor,
        currentLevel.borderColor
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentLevel.icon}</span>
            <div>
              <h3 className={cn('text-lg font-bold', currentLevel.textColor)}>
                {currentLevel.title}
              </h3>
              <p className={cn('text-sm', currentLevel.textColor)}>
                {currentLevel.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Mieter-ID</p>
            <p className="font-mono text-sm">{tenantId}</p>
          </div>
        </div>

        {/* Tenant Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Mieter</p>
            <p className="text-lg font-semibold text-gray-900">{tenantName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Offener Betrag</p>
            <p className={cn('text-xl font-bold', currentLevel.textColor)}>
              {formatCurrency(dueAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Letzte Zahlung</p>
            <p className="text-sm text-gray-900">{formatDate(lastPaymentDate)}</p>
            <p className="text-xs text-gray-500">
              vor {getDaysSincePayment()} Tagen
            </p>
          </div>
        </div>

        {/* Escalation Warning */}
        {escalationWarning && (
          <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-sm text-red-800 font-medium">
                Inkassovorbereitung aktiv - Rechtliche Schritte eingeleitet
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <ClaraButton
            variant="outline"
            onClick={handleGeneratePDF}
            className="flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Mahnbrief generieren</span>
          </ClaraButton>
          
          {status < 3 && (
            <ClaraButton
              variant="destructive"
              onClick={handleEscalate}
              className="flex items-center space-x-2"
            >
              <span>⬆️</span>
              <span>Mahnstufe erhöhen</span>
            </ClaraButton>
          )}
          
          {status === 3 && (
            <ClaraButton
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <span>⚖️</span>
              <span>An Inkasso übergeben</span>
            </ClaraButton>
          )}
        </div>
      </div>

      {/* Internal Notes Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Interne Notizen (nicht sichtbar für Mieter)
        </h4>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Notizen zum Mahnverfahren, Kontaktversuche, etc..."
          className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Entwickler-Debug: Status={status}, Amount={dueAmount}
          </p>
          <ClaraButton variant="ghost" size="sm">
            Notizen speichern
          </ClaraButton>
        </div>
      </div>

      {/* Timeline Preview (Mock) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Mahnverfahren Timeline
        </h4>
        <div className="space-y-2">
          <div className={cn(
            'flex items-center space-x-3 p-2 rounded',
            status >= 1 ? 'bg-yellow-100' : 'bg-gray-100'
          )}>
            <span className={status >= 1 ? 'text-yellow-600' : 'text-gray-400'}>
              ⚠️
            </span>
            <span className="text-sm">1. Mahnung versendet</span>
          </div>
          <div className={cn(
            'flex items-center space-x-3 p-2 rounded',
            status >= 2 ? 'bg-orange-100' : 'bg-gray-100'
          )}>
            <span className={status >= 2 ? 'text-orange-600' : 'text-gray-400'}>
              🔔
            </span>
            <span className="text-sm">2. Mahnung versendet</span>
          </div>
          <div className={cn(
            'flex items-center space-x-3 p-2 rounded',
            status >= 3 ? 'bg-red-100' : 'bg-gray-100'
          )}>
            <span className={status >= 3 ? 'text-red-600' : 'text-gray-400'}>
              🚨
            </span>
            <span className="text-sm">3. Mahnung / Inkassovorbereitung</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaraMahnungPanel;
