import { useEffect, useState } from "react";
import {
  Calendar,
  ClipboardList,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";

export default function NewAppointmentModal({ isOpen, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  const [form, setForm] = useState({
    reason: "",
    date: "",
    time: "",
    duration: "",
    specialty: "",
    notes: "",
    observations: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Obtener datos del doctor logueado
  useEffect(() => {
    const loadDoctor = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "doctors", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setDoctorData({ uid: user.uid, ...data });
          handleChange("specialty", data.specialty || "");
        }
      } catch (err) {
        console.error("Error al obtener el doctor:", err);
      }
    };
    loadDoctor();
  }, []);

  // Cargar pacientes disponibles
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(list);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    };
    loadPatients();
  }, []);

  // 🔹 Guardar cita
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedPatient || !form.date || !form.reason) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatient);
    if (!patient) {
      toast.error("Paciente no encontrado");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        ...form,
        patientId: selectedPatient,
        patientName: patient.fullname,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        doctorId: doctorData?.uid,
        doctorName: doctorData?.nombre,
        createdAt: new Date().toISOString(),
        status: "confirmada", 
      });

      toast.success("✅ Cita creada y confirmada correctamente");
      onSave?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar cita");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30",
  ];

  const durationOptions = [
    "15 minutos", "30 minutos", "45 minutos", "1 hora",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-slate-100 rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-cyan-800">
            <Calendar className="w-6 h-6 mr-2 text-cyan-600" />
            Nueva cita — {doctorData?.specialty || "Cargando..."}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Selección del paciente */}
          <section className="bg-white border border-cyan-100 rounded-xl p-5 shadow-sm">
            <h3 className="flex items-center text-cyan-700 font-semibold mb-3">
              <User className="w-5 h-5 mr-2" /> Seleccionar paciente
            </h3>
            <Select onValueChange={(v) => setSelectedPatient(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullname} — {p.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* 🔹 Detalles de la cita */}
          <section className="bg-white border border-cyan-100 rounded-xl p-5 shadow-sm">
            <h3 className="flex items-center text-cyan-700 font-semibold mb-3">
              <ClipboardList className="w-5 h-5 mr-2" /> Detalles de la cita
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Motivo</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Select onValueChange={(v) => handleChange("time", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duración</Label>
                <Select onValueChange={(v) => handleChange("duration", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* 🔹 Notas */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="flex items-center text-gray-700 font-semibold mb-3">
              <FileText className="w-5 h-5 mr-2" /> Notas y observaciones
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Notas</Label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea
                  rows={3}
                  value={form.observations}
                  onChange={(e) =>
                    handleChange("observations", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg"
            >
              {loading ? "Guardando..." : "Confirmar cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
