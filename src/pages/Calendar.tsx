import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import CalendarView from '@/components/CalendarView';
import NewAppointmentModal from '@/components/NewAppointmentModal';
import { Appointment } from '@/data/mockData';
import { formatDateTime } from '@/lib/dateUtils';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from "@/firebase/config";


interface NavigationData {
  patientId?: string;
}

interface CalendarProps {
  onNavigate?: (section: string, data?: NavigationData) => void;
}

export default function Calendar({ onNavigate }: CalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar citas en tiempo real desde Firebase
  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentsData.push({
          id: doc.id,
          ...doc.data()
        } as Appointment);
      });
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error al cargar citas:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
  const patientName = appointment.patientName?.toLowerCase() || "";
  const reason = appointment.reason?.toLowerCase() || "";
  const status = appointment.status || "";

  const matchesSearch =
    patientName.includes(searchTerm.toLowerCase()) ||
    reason.includes(searchTerm.toLowerCase());

  const matchesStatus = statusFilter === "all" || status === statusFilter;

  return matchesSearch && matchesStatus;
});


  const handleNewAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      await addDoc(collection(db, 'appointments'), {
        ...appointment,
        createdAt: serverTimestamp()
      });
      setShowNewAppointmentModal(false);
    } catch (error) {
      console.error('Error al crear cita:', error);
      alert('Error al crear la cita. Por favor, intenta de nuevo.');
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    console.log('Editar cita:', appointment);
    setShowAppointmentDetails(false);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
        setShowAppointmentDetails(false);
      } catch (error) {
        console.error('Error al eliminar cita:', error);
        alert('Error al eliminar la cita. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'confirmed',
        updatedAt: serverTimestamp()
      });
      setShowAppointmentDetails(false);
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      alert('Error al confirmar la cita. Por favor, intenta de nuevo.');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      try {
        await updateDoc(doc(db, 'appointments', appointmentId), {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });
        setShowAppointmentDetails(false);
      } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert('Error al cancelar la cita. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleViewPatient = (patientId: string) => {
    onNavigate?.('patients', { patientId });
    setShowAppointmentDetails(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'followup': return 'Seguimiento';
      case 'checkup': return 'Revisión';
      case 'emergency': return 'Urgencia';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gestiona las citas médicas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por paciente o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las citas</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vista de calendario */}
      <CalendarView 
        appointments={filteredAppointments}
        onNewAppointment={() => setShowNewAppointmentModal(true)}
        onAppointmentClick={handleAppointmentClick}
      />

      {/* Modal Nueva Cita */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSave={handleNewAppointment}
      />

      {/* Modal Detalles de Cita */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedAppointment.patientName}</h3>
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusLabel(selectedAppointment.status)}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha y hora:</span>
                  <span className="font-medium">
                    {formatDateTime(selectedAppointment.date, selectedAppointment.time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{selectedAppointment.duration} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{getTypeLabel(selectedAppointment.type)}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Motivo:</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedAppointment.reason}
                </p>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas:</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewPatient(selectedAppointment.patientId)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Paciente
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditAppointment(selectedAppointment)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                
                {selectedAppointment.status === 'pending' && (
                  <Button
                    size="sm"
                    className="medical-primary"
                    onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                  >
                    Confirmar
                  </Button>
                )}
                
                {selectedAppointment.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancelar
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}