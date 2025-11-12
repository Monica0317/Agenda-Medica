import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Eye,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsSnap = await getDocs(collection(db, "appointments"));
        const appointmentsData: Appointment[] = appointmentsSnap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
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
            duration: data.duration ?? undefined,
            type: data.type ?? "consultation",
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

  // 🩺 Ver detalles de cita
  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleAcceptAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      // 1️⃣ Agregar a colección "patients"
      await addDoc(collection(db, "patients"), {
        fullName: selectedAppointment.patientName,
        email: selectedAppointment.email || "",
        phone: selectedAppointment.phone || "",
        specialty: selectedAppointment.specialty || "General",
        reason: selectedAppointment.reason,
        date: selectedAppointment.date,
        time: selectedAppointment.time,
        createdAt: new Date().toISOString(),
      });

      // 2️⃣ Eliminar de appointments
      const ref = doc(db, "appointments", selectedAppointment.id);
      await deleteDoc(ref);

      // 3️⃣ Actualizar estado local
      setAppointments((prev) => prev.filter((a) => a.id !== selectedAppointment.id));

      // 4️⃣ Cerrar modal
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error al aceptar cita:", error);
    }
  };

  // ✅ Crear nueva cita con datos reales del paciente desde Firestore
  const handleNewAppointment = async (appointmentData: any) => {
    try {
      // Buscar los datos del paciente en Firestore usando su ID
      const patientRef = doc(db, "patients", appointmentData.patientId);
      const patientSnap = await getDoc(patientRef);

      if (!patientSnap.exists()) {
        console.error("Paciente no encontrado con ID:", appointmentData.patientId);
        return;
      }

      const patientData = patientSnap.data();

      // Crear cita en Firestore con datos del paciente
      const docRef = await addDoc(collection(db, "appointments"), {
        ...appointmentData,
        patientName: patientData.fullname ?? "",
        email: patientData.email ?? "",
        phone: patientData.phone ?? "",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Actualizar estado local
      setAppointments((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...appointmentData,
          patientName: patientData.fullname ?? "",
          email: patientData.email ?? "",
          phone: patientData.phone ?? "",
          status: "pending",
        },
      ]);

      setShowNewAppointmentModal(false);
    } catch (error) {
      console.error("Error al crear nueva cita:", error);
    }
  };

  // 🔹 Filtrado de citas
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.date === today);
  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const upcomingAppointments = appointments
    .filter((a) => a.date && new Date(a.date) >= new Date(today) && a.status === "confirmed")
    .slice(0, 5);

  return (
  <div className="flex w-full ">
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, Dr. García — {formatDate(new Date().toISOString())}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigate?.("patients")} className="cursor-pointer">
          <StatCard title="Total Pacientes" value={patientsCount} icon={Users} color="blue" />
        </div>
        <StatCard title="Citas Hoy" value={todayAppointments.length} icon={Calendar} color="green" />
        <StatCard title="Solicitudes Pendientes" value={pendingAppointments.length} icon={Clock} color="yellow" />
      </div>

      {/* Solicitudes pendientes */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-700">
            <Clock className="w-5 h-5 mr-2" /> Solicitudes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAppointments.length > 0 ? (
            <div className="space-y-4">
              {pendingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onViewDetails={() => handleViewAppointmentDetails(apt)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No hay solicitudes pendientes</p>
          )}
        </CardContent>
      </Card>

      {/* Próximas citas confirmadas */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" /> Próximas Citas Confirmadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onViewDetails={() => handleViewAppointmentDetails(apt)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No hay citas confirmadas por ahora
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal Nueva Cita */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSave={handleNewAppointment}
      />

      {/* Modal Detalles */}
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
              <p><strong>Estado:</strong> {selectedAppointment.status}</p>

              <div className="flex justify-end mt-6 space-x-3">
                {selectedAppointment.status === "pending" && (
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleAcceptAppointment}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Aceptar y agregar a pacientes
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
  </div>
);

}
