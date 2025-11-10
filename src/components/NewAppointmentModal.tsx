import { useState } from "react";
import { Calendar, ClipboardList, User, Stethoscope, Clock } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";

export default function NewAppointmentModal({ isOpen, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const initialForm = {
    fullName: "",
    idType: "",
    idNumber: "",
    birthDate: "",
    phone: "",
    email: "",
    eps: "",
    diagnosis: "",
    reason: "",
    specialty: "",
    priority: "",
    medicalHistory: "",
    date: "",
    time: "",
    duration: "",
    office: "",
    assignedDoctor: "",
    requiresTests: "",
    testsDetails: "",
    notes: "",
  };
  
  const [form, setForm] = useState(initialForm);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!form.fullName || !form.date || !form.specialty) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        ...form,
        createdAt: new Date().toISOString(),
        status: "confirmed",
        createdBy: "doctor",
      });
      toast.success("✅ Cita agendada correctamente");
      setForm(initialForm);
      onSave?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al agendar cita");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30",
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
    "18:00"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-300 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-cyan-100 pb-4">
          <DialogTitle className="flex items-center text-2xl font-bold text-cyan-800">
            <Calendar className="w-6 h-6 mr-3 text-cyan-600" />
            Agendar Nueva Cita
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Complete la información del paciente y los detalles de la cita</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4 px-1">
          {/* Datos del paciente */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-cyan-100">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-cyan-600" />
              <h3 className="font-semibold text-lg text-cyan-800">Datos del Paciente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nombre completo *</Label>
                <Input 
                  placeholder="Ej: Juan Pérez" 
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tipo de documento</Label>
                <Select value={form.idType} onValueChange={(v) => handleChange("idType", v)}>
                  <SelectTrigger className="border-cyan-200">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PA">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Número de documento</Label>
                <Input 
                  placeholder="123456789" 
                  value={form.idNumber}
                  onChange={(e) => handleChange("idNumber", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha de nacimiento</Label>
                <Input 
                  type="date" 
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
                <Input 
                  placeholder="300 123 4567" 
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input 
                  type="email" 
                  placeholder="ejemplo@correo.com" 
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Información clínica */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-cyan-100">
            <div className="flex items-center mb-4">
              <Stethoscope className="w-5 h-5 mr-2 text-cyan-600" />
              <h3 className="font-semibold text-lg text-cyan-800">Información Clínica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">EPS o seguro médico</Label>
                <Input 
                  placeholder="Ej: Sura, Sanitas..." 
                  value={form.eps}
                  onChange={(e) => handleChange("eps", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Especialidad requerida *</Label>
                <Input 
                  placeholder="Ej: Cardiología" 
                  value={form.specialty}
                  onChange={(e) => handleChange("specialty", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Diagnóstico previo</Label>
                <Input 
                  placeholder="Diagnóstico o sospecha" 
                  value={form.diagnosis}
                  onChange={(e) => handleChange("diagnosis", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nivel de prioridad</Label>
                <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                  <SelectTrigger className="border-cyan-200">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="prioritaria">Prioritaria</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Historia clínica relevante</Label>
                <Textarea 
                  placeholder="Información médica importante para la consulta..." 
                  value={form.medicalHistory}
                  onChange={(e) => handleChange("medicalHistory", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Detalles de la cita */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-cyan-100">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-cyan-600" />
              <h3 className="font-semibold text-lg text-cyan-800">Detalles de la Cita</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha de la cita *</Label>
                <Input 
                  type="date" 
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Hora de la cita</Label>
                <Select value={form.time} onValueChange={(v) => handleChange("time", v)}>
                  <SelectTrigger className="border-cyan-200">
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Duración estimada</Label>
                <Select value={form.duration} onValueChange={(v) => handleChange("duration", v)}>
                  <SelectTrigger className="border-cyan-200">
                    <SelectValue placeholder="Seleccionar duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30min">30 minutos</SelectItem>
                    <SelectItem value="45min">45 minutos</SelectItem>
                    <SelectItem value="60min">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Consultorio o sala</Label>
                <Input 
                  placeholder="Ej: Consultorio 3A" 
                  value={form.office}
                  onChange={(e) => handleChange("office", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Doctor especialista asignado</Label>
                <Input 
                  placeholder="Nombre del médico" 
                  value={form.assignedDoctor}
                  onChange={(e) => handleChange("assignedDoctor", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">¿Requiere exámenes previos?</Label>
                <Select value={form.requiresTests} onValueChange={(v) => handleChange("requiresTests", v)}>
                  <SelectTrigger className="border-cyan-200">
                    <SelectValue placeholder="Seleccionar opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="si">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.requiresTests === "si" && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Especificar exámenes requeridos</Label>
                  <Textarea 
                    placeholder="Lista de exámenes necesarios antes de la cita..." 
                    value={form.testsDetails}
                    onChange={(e) => handleChange("testsDetails", e.target.value)}
                    className="border-cyan-200 focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Observaciones médicas adicionales</Label>
                <Textarea 
                  placeholder="Notas importantes para la cita..." 
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-cyan-100">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="medical-primary hover:bg-cyan-400"
            >
              {loading ? "Guardando..." : "Guardar Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}