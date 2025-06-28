import React from 'react';
import { Upload, Wrench, DollarSign, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'upload',
      title: 'Neue Dokumente hochgeladen',
      description: '3 neue Dokumente wurden hochgeladen',
      time: 'Vor 2 Stunden',
      icon: Upload,
      color: 'blue',
      status: 'completed'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Wartungsanfrage abgeschlossen',
      description: 'Heizungsreparatur in Wohnung 3B',
      time: 'Vor 5 Stunden',
      icon: Wrench,
      color: 'green',
      status: 'completed'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Mietzahlung eingegangen',
      description: 'Zahlung von €1.250 für Wohnung 2A',
      time: 'Vor 1 Tag',
      icon: DollarSign,
      color: 'emerald',
      status: 'completed'
    },
    {
      id: 4,
      type: 'contract',
      title: 'Vertrag läuft bald ab',
      description: 'Mietvertrag Wohnung 1C läuft in 30 Tagen ab',
      time: 'Vor 2 Tagen',
      icon: FileText,
      color: 'orange',
      status: 'warning'
    },
    {
      id: 5,
      type: 'maintenance',
      title: 'Neue Wartungsanfrage',
      description: 'Wasserschaden in Wohnung 4A gemeldet',
      time: 'Vor 3 Tagen',
      icon: AlertCircle,
      color: 'red',
      status: 'urgent'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Aktuelle Aktivitäten</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Alle anzeigen
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`
                p-2 rounded-lg flex-shrink-0
                ${getColorClasses(activity.color)}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {activity.title}
                  </h3>
                  {getStatusIcon(activity.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm text-gray-600 hover:text-gray-700 font-medium">
          Weitere Aktivitäten laden
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;

