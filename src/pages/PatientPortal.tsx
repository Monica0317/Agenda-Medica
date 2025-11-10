import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/dateUtils";

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    documentType: "",
    documentNumber: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    eps: "",
    affiliation: "",
    specialty: "",
    reason: "",
    firstTime: "",
    date: "",
    time: "",
    notes: "",
    doctorId: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);

  // 🔹 Detectar usuario autenticado y cargar citas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const q = query(collection(db, "appointments"), where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        const userAppointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAppointments(userAppointments);
      }
    });

    // Cargar todos los doctores disponibles
    const fetchDoctors = async () => {
      const docsSnap = await getDocs(collection(db, "doctors"));
      const list = docsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(list);
    };

    fetchDoctors();
    return () => unsubscribe();
  }, []);

  // 🔹 Filtrar doctores por especialidad
  useEffect(() => {
    if (appointmentForm.specialty) {
      const filtered = doctors.filter((doc) => doc.specialty === appointmentForm.specialty);
      setFilteredDoctors(filtered);
      setAppointmentForm({ ...appointmentForm, doctorId: "" }); // resetear doctor seleccionado
    } else {
      setFilteredDoctors([]);
    }
  }, [appointmentForm.specialty, doctors]);

  // Enviar solicitud de cita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para solicitar una cita.");
      return;
    }

    if (!appointmentForm.doctorId || !appointmentForm.specialty) {
      alert("Por favor selecciona especialidad y doctor.");
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        ...appointmentForm,
        status: "pending",
        userId: user.uid,
        createdAt: new Date(),
      });

      setIsSubmitted(true);
      setAppointmentForm({
        name: "",
        documentType: "",
        documentNumber: "",
        birthDate: "",
        phone: "",
        email: "",
        address: "",
        eps: "",
        affiliation: "",
        specialty: "",
        reason: "",
        firstTime: "",
        date: "",
        time: "",
        notes: "",
        doctorId: "",
      });
    } catch (error) {
      console.error("Error al guardar cita:", error);
    }
  };

  const specialties = Array.from(new Set(doctors.map((doc) => doc.specialty || "General")));

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Portal del Paciente - MedConnect
            </h1>
            <p className="text-gray-600">Gestión de citas médicas</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* TABS */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <Button
            variant={activeTab === "request" ? "default" : "ghost"}
            className={`flex-1 ${activeTab === "request" ? "medical-primary" : ""}`}
            onClick={() => setActiveTab("request")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Solicitar Cita
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            className={`flex-1 ${activeTab === "history" ? "medical-primary" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Mis Citas
          </Button>
        </div>

        {/* FORMULARIO */}
        {activeTab === "request" && (
          <div className="space-y-6">
            {isSubmitted ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                    ¡Solicitud Enviada!
                  </h3>
                  <p className="text-emerald-700 mb-4">
                    Tu solicitud ha sido enviada. El doctor te contactará pronto.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Nueva Cita</CardTitle>
                  <p className="text-gray-600">
                    Completa tus datos y selecciona la especialidad que necesitas
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DATOS PERSONALES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre Completo *</Label>
                        <Input
                          value={appointmentForm.name}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Tipo de Documento *</Label>
                        <Select
                          value={appointmentForm.documentType}
                          onValueChange={(value) => setAppointmentForm({ ...appointmentForm, documentType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CC">Cédula</SelectItem>
                            <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                            <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Número de Documento *</Label>
                        <Input
                          value={appointmentForm.documentNumber}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, documentNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Fecha de Nacimiento *</Label>
                        <Input
                          type="date"
                          value={appointmentForm.birthDate}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, birthDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Teléfono *</Label>
                        <Input
                          value={appointmentForm.phone}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={appointmentForm.email}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Dirección</Label>
                        <Input
                          value={appointmentForm.address}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* INFORMACIÓN DE SALUD */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-700">Información de Salud</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>EPS o Seguro Médico</Label>
                          <Input
                            value={appointmentForm.eps}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, eps: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Tipo de Afiliación</Label>
                          <Select
                            value={appointmentForm.affiliation}
                            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, affiliation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Contributivo">Contributivo</SelectItem>
                              <SelectItem value="Subsidiado">Subsidiado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label>Motivo de la Consulta *</Label>
                          <Textarea
                            value={appointmentForm.reason}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>¿Es primera vez con este especialista?</Label>
                          <Select
                            value={appointmentForm.firstTime}
                            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, firstTime: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                  
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-700">Preferencias de Cita</h3>
                       {/* Especialidad */}
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidad *</Label>
                      <Select
                        value={appointmentForm.specialty}
                        onValueChange={(value) => setAppointmentForm({ ...appointmentForm, specialty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((spec, index) => (
                            <SelectItem key={index} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Doctor */}
                    {appointmentForm.specialty && (
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Doctor *</Label>
                        <Select
                          value={appointmentForm.doctorId}
                          onValueChange={(value) => setAppointmentForm({ ...appointmentForm, doctorId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un doctor" />
                          </SelectTrigger>
                          <SelectContent>a
                            {filteredDoctors.length > 0 ? (
                              filteredDoctors.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id}>
                                  {doc.nombre} — {doc.specialty}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled value="">
                                No hay doctores disponibles
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Fecha Preferida</Label>
                          <Input
                            type="date"
                            value={appointmentForm.date}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div>
                          <Label>Hora Preferida</Label>
                          <Select
                            value={appointmentForm.time}
                            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, time: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una hora" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label>Notas o solicitudes especiales</Label>
                          <Textarea
                            value={appointmentForm.notes}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full medical-primary">
                      Enviar Solicitud
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* HISTORIAL */}
        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Mis Citas</CardTitle>
              <p className="text-gray-600">Historial de tus citas médicas</p>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-gray-600 text-center py-6">
                  No tienes citas registradas.
                </p>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {formatDateTime(appointment.date, appointment.time)}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          appointment.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : appointment.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {appointment.status === "confirmed"
                          ? "Confirmada"
                          : appointment.status === "pending"
                          ? "Pendiente"
                          : "Cancelada"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
