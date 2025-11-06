import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Calendar from '@/pages/Calendar';
import PatientProfile from '@/pages/PatientProfile';
import PatientPortal from '@/pages/PatientPortal';
import Messages from '@/pages/Messages';
import Settings from '@/pages/Settings';
import { mockPatients } from '@/data/mockData';

const queryClient = new QueryClient();

type AppSection = 'dashboard' | 'calendar' | 'patients' | 'messages' | 'settings' | 'patient-portal';

interface NavigationData {
  patientId?: string;
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section as AppSection);
    if (section !== 'patients') {
      setSelectedPatientId(null);
    }
  };

  const handleNavigation = (section: string, data?: NavigationData) => {
    if (section === 'patients' && data?.patientId) {
      setSelectedPatientId(data.patientId);
    }
    setActiveSection(section as AppSection);
  };

  const renderPatientsList = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">Gestiona la información de tus pacientes</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPatients.map((patient) => (
          <div
            key={patient.id}
            className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
            onClick={() => setSelectedPatientId(patient.id)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">{patient.age} años</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{patient.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Última visita:</span>
                <span className="font-medium">{new Date(patient.lastVisit).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Grupo sanguíneo:</span>
                <span className="font-medium">{patient.bloodType}</span>
              </div>
            </div>
            
            {patient.allergies.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-red-600 font-medium">
                  Alergias: {patient.allergies.join(', ')}
                </p>
              </div>
            )}
            
            <div className="mt-4 flex space-x-2">
              <div className="flex-1 bg-blue-50 rounded px-2 py-1">
                <p className="text-xs text-blue-800 font-medium">
                  {patient.notes.length} notas médicas
                </p>
              </div>
              <div className="flex-1 bg-emerald-50 rounded px-2 py-1">
                <p className="text-xs text-emerald-800 font-medium">
                  {patient.files.length} archivos
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeSection === 'patient-portal') {
      return <PatientPortal />;
    }

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'calendar':
        return <Calendar onNavigate={handleNavigation} />;
      case 'patients':
        if (selectedPatientId) {
          return (
            <PatientProfile
              patientId={selectedPatientId}
              onBack={() => setSelectedPatientId(null)}
            />
          );
        }
        return renderPatientsList();
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Vista del portal del paciente (sin sidebar)
  if (activeSection === 'patient-portal') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen">
            <PatientPortal />
            {/* Botón para volver al panel médico */}
            <div className="fixed bottom-6 left-6">
              <button
                onClick={() => setActiveSection('dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-medium"
              >
                ← Panel Médico
              </button>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
        
        {/* Botón flotante para acceder al portal del paciente */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setActiveSection('patient-portal')}
            className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-medium"
          >
            Portal Paciente
          </button>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;