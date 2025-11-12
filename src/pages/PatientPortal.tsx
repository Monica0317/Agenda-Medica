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
import { CheckCircle, Calendar, Clock, User, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState("request");
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
  const [messageForm, setMessageForm] = useState({
    specialty: "",
    doctorId: "",
    subject: "",
    content: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filteredDoctorsForMessage, setFilteredDoctorsForMessage] = useState([]);

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

  // Filtrar doctores por especialidad para citas
  useEffect(() => {
    if (appointmentForm.specialty) {
      const filtered = doctors.filter((doc) => doc.specialty === appointmentForm.specialty);
      setFilteredDoctors(filtered);
      setAppointmentForm({ ...appointmentForm, doctorId: "" });
    } else {
      setFilteredDoctors([]);
    }
  }, [appointmentForm.specialty, doctors]);
const [receivedMessages, setReceivedMessages] = useState([]);

useEffect(() => {
  if (!user) return;
  const fetchMessages = async () => {
    const q = query(collection(db, "messages"), where("from", "==", user.email));
    const snapshot = await getDocs(q);
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReceivedMessages(msgs);
  };
  fetchMessages();
}, [user]);

  // Filtrar doctores por especialidad para mensajes
  useEffect(() => {
    if (messageForm.specialty) {
      const filtered = doctors.filter((doc) => doc.specialty === messageForm.specialty);
      setFilteredDoctorsForMessage(filtered);
      setMessageForm({ ...messageForm, doctorId: "" });
    } else {
      setFilteredDoctorsForMessage([]);
    }
  }, [messageForm.specialty, doctors]);

  const handleSubmit = async (e) => {
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

      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Error al guardar cita:", error);
      alert("Error al enviar la solicitud");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para enviar mensajes.");
      return;
    }

    if (!messageForm.doctorId || !messageForm.subject || !messageForm.content) {
      alert("Por favor completa todos los campos del mensaje.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        from: user.email || "Paciente",
        subject: messageForm.subject,
        content: messageForm.content,
        type: "patient",
        read: false,
        date: new Date().toISOString(),
        toDoctorId: messageForm.doctorId,
      });

      setIsMessageSent(true);
      setMessageForm({
        specialty: "",
        doctorId: "",
        subject: "",
        content: "",
      });

      setTimeout(() => setIsMessageSent(false), 5000);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje");
    }
  };

  const specialties = Array.from(new Set(doctors.map((doc) => doc.specialty || "General")));

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
  ];

  const formatDateTime = (date, time) => {
    if (!date) return "Fecha no definida";
    return `${new Date(date).toLocaleDateString('es-ES')} ${time || ''}`;
  };

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
            <p className="text-gray-600">Gestión de citas y mensajes médicos</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* TABS */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <Button
            variant={activeTab === "request" ? "default" : "ghost"}
            className={`flex-1 ${activeTab === "request" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""}`}
            onClick={() => setActiveTab("request")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Solicitar Cita
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            className={`flex-1 ${activeTab === "history" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Mis Citas
          </Button>

          <Button
            variant={activeTab === "messages" ? "default" : "ghost"}
            className={`flex-1 ${activeTab === "messages" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensaje
          </Button>
        </div>

        {/* FORMULARIO DE CITA */}
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

                    {/* PREFERENCIAS DE CITA */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-700">Preferencias de Cita</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Especialidad *</Label>
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

                        {appointmentForm.specialty && (
                          <div>
                            <Label>Doctor *</Label>
                            <Select
                              value={appointmentForm.doctorId}
                              onValueChange={(value) => setAppointmentForm({ ...appointmentForm, doctorId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un doctor" />
                              </SelectTrigger>
                              <SelectContent>
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
                        </div>

                        <div>
                          <Label>Notas o solicitudes especiales</Label>
                          <Textarea
                            value={appointmentForm.notes}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      Enviar Solicitud
                    </Button>
                  </form>
                  <div className="mt-10 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Mensajes enviados y respuestas
                    </h3>
                    {receivedMessages.length === 0 ? (
                      <p className="text-gray-600 text-center">Aún no has enviado mensajes.</p>
                    ) : (
                      <div className="space-y-4">
                        {receivedMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{msg.subject}</p>
                                <p className="text-sm text-gray-600">
                                  Enviado el {new Date(msg.date).toLocaleString("es-ES")}
                                </p>
                              </div>
                              <Badge
                                className={`${
                                  msg.reply
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {msg.reply ? "Respondido" : "Sin respuesta"}
                              </Badge>
                            </div>

                            <div className="mt-2">
                              <p className="text-gray-800 mb-2">
                                <strong>Tu mensaje:</strong> {msg.content}
                              </p>
                              {msg.reply ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
                                  <p className="text-emerald-800">
                                    <strong>Respuesta del médico:</strong> {msg.reply}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Aún sin respuesta del médico.</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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

        {/* ENVIAR MENSAJE */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            {isMessageSent ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                    ¡Mensaje Enviado!
                  </h3>
                  <p className="text-emerald-700 mb-4">
                    Tu mensaje ha sido enviado al doctor. Recibirás una respuesta pronto.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Mensaje a un Doctor</CardTitle>
                  <p className="text-gray-600">
                    Selecciona un doctor y envía tu consulta o mensaje
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <Label>Especialidad *</Label>
                      <Select
                        value={messageForm.specialty}
                        onValueChange={(value) => setMessageForm({ ...messageForm, specialty: value })}
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

                    {messageForm.specialty && (
                      <div>
                        <Label>Doctor *</Label>
                        <Select
                          value={messageForm.doctorId}
                          onValueChange={(value) => setMessageForm({ ...messageForm, doctorId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredDoctorsForMessage.length > 0 ? (
                              filteredDoctorsForMessage.map((doc) => (
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

                    <div>
                      <Label>Asunto *</Label>
                      <Input
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        placeholder="Ej: Solicitud de cita o consulta médica"
                        required
                      />
                    </div>

                    <div>
                      <Label>Mensaje *</Label>
                      <Textarea
                        value={messageForm.content}
                        onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                        placeholder="Escribe tu mensaje aquí..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}