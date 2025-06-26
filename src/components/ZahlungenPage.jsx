import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import ClaraZahlungsPanel from './organisms/ClaraZahlungsPanel';

const ZahlungenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex">
      <Sidebar currentPage="zahlungen" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="gap-2 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white hover:border-blue-500 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>
          </div>
        </div>

        {/* Clara360 v3.1 Payment Panel */}
        <ClaraZahlungsPanel tenantId="waldhofstrasse_76" />
      </main>
    </div>
  );
};

export default ZahlungenPage;
