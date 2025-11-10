import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Users, Calendar, Clock, Plus, Eye, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/StatCard";
import AppointmentCard from "@/components/AppointmentCard";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/dateUtils";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  email?: string;
  phone?: string;
  date: string;
  time: string;
  reason: string;
  specialty?: string;
  status: "pending" | "confirmed" | "cancelled";
  doctorId?: string;
  userId?: string;
  duration?: number;
  type: "consultation" | "followup" | "emergency" | "checkup";
}

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsCount, setPatientsCount] = useState(0);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cargar datos desde Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsSnap = await getDocs(collection(db, "appointments"));
        const appointmentsData: Appointment[] = appointmentsSnap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            patientId: data.userId ?? data.patientId ?? "",
            patientName: data.name ?? data.patientName ?? "",
            email: data.email,
            phone: data.phone,
            date: data.date,
            time: data.time,
            reason: data.reason,
            specialty: data.specialty,
            status: (data.status || "pending") as "pending" | "confirmed" | "cancelled",
            doctorId: data.doctorId,
            userId: data.userId,
            duration: data.duration ?? data.durationMinutes ?? undefined,
            type: data.type ?? data.appointmentType ?? undefined,
          };
        });

        setAppointments(appointmentsData);

        const patientsSnap = await getDocs(collection(db, "patients"));
        setPatientsCount(patientsSnap.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleAcceptAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const ref = doc(db, "appointments", selectedAppointment.id);
      await updateDoc(ref, { status: "confirmed" });

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id ? { ...a, status: "confirmed" } : a
        )
      );

      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error al confirmar cita:", error);
    }
  };

  // Crear nueva cita con estado "pending"
  const handleNewAppointment = async (appointmentData: any) => {
    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        ...appointmentData,
        status: "pending",
      });

      setAppointments((prev) => [
        ...prev,
        { id: docRef.id, ...appointmentData, status: "pending" },
      ]);

      setShowNewAppointmentModal(false);
    } catch (error) {
      console.error("Error al crear nueva cita:", error);
    }
  };

  // Filtrado de citas
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.date === today);
  const upcomingAppointments = appointments
    .filter((a) => a.date && new Date(a.date) >= new Date(today))
    .slice(0, 5);
  const pendingAppointments = appointments.filter((a) => a.status === "pending");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, Dr. García - {formatDate(new Date().toISOString())}
          </p>
        </div>
        <Button
          className="medical-primary hover:bg-cyan-400"
          onClick={() => setShowNewAppointmentModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigate?.("patients")} className="cursor-pointer">
          <StatCard title="Total Pacientes" value={patientsCount} icon={Users} color="blue" />
        </div>
        <StatCard title="Citas Hoy" value={todayAppointments.length} icon={Calendar} color="green" />
        <StatCard title="Citas Pendientes" value={pendingAppointments.length} icon={Clock} color="yellow" />
      </div>

      {/* Próximas citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Próximas Citas</span>
                <Button variant="outline" size="sm" onClick={() => onNavigate?.("calendar")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver todas
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onViewDetails={() => handleViewAppointmentDetails(apt)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas programadas</p>
                    <Button
                      className="mt-4 medical-primary hover:bg-cyan-400"
                      onClick={() => setShowNewAppointmentModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Programar Primera Cita
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(todayAppointments.length / Math.max(appointments.length, 1)) * 100} />
              <p className="text-sm text-gray-600 text-center mt-2">
                {todayAppointments.length} de {appointments.length} pacientes asistieron hoy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Nueva Cita */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSave={handleNewAppointment}
      />

      {/* Modal Detalles de Cita */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Detalles de Cita</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-3 mt-2">
              <p><strong>Nombre:</strong> {selectedAppointment.patientName}</p>
              <p><strong>Email:</strong> {selectedAppointment.email || "No especificado"}</p>
              <p><strong>Teléfono:</strong> {selectedAppointment.phone || "No especificado"}</p>
              <p><strong>Especialidad:</strong> {selectedAppointment.specialty || "General"}</p>
              <p><strong>Motivo:</strong> {selectedAppointment.reason}</p>
              <p><strong>Fecha:</strong> {formatDate(selectedAppointment.date)} a las {selectedAppointment.time}</p>
              <p><strong>Tipo:</strong> {selectedAppointment.type || "Consulta"}</p>
              <p><strong>Estado:</strong> {selectedAppointment.status}</p>

              <div className="flex justify-end mt-6 space-x-3">
                {selectedAppointment.status === "pending" && (
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleAcceptAppointment}
                  >
                    Aceptar Cita
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
