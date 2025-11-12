import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  FileText,
  Upload,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatDateTime } from "@/lib/dateUtils";

interface Appointment {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  email?: string;
  lastVisit?: string;
  files?: string[];
  notes?: string[];
  accepted?: boolean;
}

export default function PatientProfile() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;

      try {
        let patientData: any = null;

        const patientRef = doc(db, "patients", patientId);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          patientData = { id: patientSnap.id, ...patientSnap.data() };
        } else {
          const appointmentsQuery = query(
            collection(db, "appointments"),
            where("patientId", "==", patientId)
          );
          const appointmentsSnap = await getDocs(appointmentsQuery);

          if (!appointmentsSnap.empty) {
            const firstAppointment = appointmentsSnap.docs[0].data();
            patientData = {
              id: patientId,
              name: firstAppointment.name || firstAppointment.patientName || "Paciente sin nombre",
              email: firstAppointment.email || "",
              phone: firstAppointment.phone || "",
              age: firstAppointment.age || null,
              lastVisit: firstAppointment.date || "",
              accepted: false,
              files: [],
              notes: [],
            };
          }
        }

        if (patientData) {
          setPatient(patientData as Patient);
        }

        const allAppointmentsQuery = query(
          collection(db, "appointments"),
          where("patientId", "==", patientId)
        );
        const allAppointmentsSnap = await getDocs(allAppointmentsQuery);
        const appts = allAppointmentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];

        setAppointments(appts);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !patientId || !patient) return;
    
    try {
      const timestamp = new Date().toISOString();
      const noteWithDate = `[${formatDate(timestamp)}] ${newNote}`;
      
      if (patient.accepted) {
        const patientRef = doc(db, "patients", patientId);
        const updatedNotes = [...(patient.notes || []), noteWithDate];
        await updateDoc(patientRef, { notes: updatedNotes });
        setPatient((prev) => (prev ? { ...prev, notes: updatedNotes } : prev));
      } else {
        const updatedNotes = [...(patient.notes || []), noteWithDate];
        setPatient((prev) => (prev ? { ...prev, notes: updatedNotes } : prev));
      }
      
      setNewNote("");
    } catch (error) {
      console.error("Error al guardar nota:", error);
    }
  };

  const handleAcceptPatient = async () => {
    if (!patient) return;

    try {
      const newPatientRef = await addDoc(collection(db, "patients"), {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age || null,
        accepted: true,
        files: patient.files || [],
        notes: patient.notes || [],
        createdAt: new Date().toISOString(),
        lastVisit: patient.lastVisit || new Date().toISOString(),
      });

      // Actualizar las citas para que apunten al nuevo ID del paciente
      const appointmentsToUpdate = appointments.filter(apt => apt.id);
      for (const apt of appointmentsToUpdate) {
        const aptRef = doc(db, "appointments", apt.id);
        await updateDoc(aptRef, { patientId: newPatientRef.id });
      }

      setPatient((prev) => (prev ? { ...prev, accepted: true, id: newPatientRef.id } : prev));
      setShowAcceptModal(false);
      
      // Redirigir al nuevo perfil
      navigate(`/patients/${newPatientRef.id}`);
    } catch (error) {
      console.error("Error al aceptar paciente:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-pulse">Cargando paciente...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Paciente no encontrado</p>
        <Button onClick={() => navigate("/dashboard/patients")} variant="outline">
          Volver a pacientes
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/patients")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600">Perfil del paciente</p>
        </div>

       
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-cyan-700">
                    {patient.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                {patient.age && <p className="text-gray-600">{patient.age} años</p>}
              </div>

              <Separator />

              <div className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{patient.email}</span>
                  </div>
                )}
                {patient.lastVisit && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Última visita: {formatDate(patient.lastVisit)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Archivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Archivos</span>
                <Button size="sm" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.files && patient.files.length > 0 ? (
                <div className="space-y-2">
                  {patient.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 flex-1">{file}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay archivos subidos
                </p>
              )}
            </CardContent>
          </Card>
        </div>

    
        <div className="lg:col-span-2 space-y-6">
          {/* Historial de Citas */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {formatDateTime(apt.date, apt.time)}
                        </span>
                        <Badge
                          className={
                            apt.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : apt.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {apt.status === "confirmed"
                            ? "Confirmada"
                            : apt.status === "pending"
                            ? "Pendiente"
                            : "Cancelada"}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{apt.reason}</p>
                      {apt.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay citas registradas.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notas Médicas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Médicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notas existentes */}
              {patient.notes && patient.notes.length > 0 && (
                <div className="space-y-3">
                  {patient.notes.map((note, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <p className="text-sm text-blue-900">{note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar nueva nota */}
              <div className={patient.notes && patient.notes.length > 0 ? "border-t pt-4" : ""}>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Agregar nueva nota o diagnóstico..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleAddNote} 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={!newNote.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal aceptar paciente */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceptar Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Deseas aceptar a <strong>{patient.name}</strong> como tu paciente?
            </p>
            <p className="text-sm text-gray-500">
              Esto creará un perfil oficial en tu base de datos y podrás gestionar todas sus citas y expedientes médicos.
            </p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowAcceptModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAcceptPatient} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Aceptar Paciente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}