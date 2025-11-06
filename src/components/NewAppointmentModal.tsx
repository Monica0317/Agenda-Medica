import { useState } from 'react';
import { X, Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockPatients, Appointment } from '@/data/mockData';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  selectedDate?: string;
  selectedTime?: string;
}
type AppointmentType = 'consultation' | 'followup' | 'checkup' | 'emergency';

interface AppointmentFormData {
  patientId: string;
  date: string;
  time: string;
  reason: string;
  type: AppointmentType;
  duration: number;
  notes: string;
}
export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSave,
  selectedDate = '',
  selectedTime = ''
}: NewAppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    date: selectedDate,
    time: selectedTime,
    reason: '',
    type: 'consultation', 
    duration: 30,
    notes: '',
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPatient = mockPatients.find(p => p.id === formData.patientId);
    
    if (selectedPatient) {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: 'pending' as const,
        duration: formData.duration,
        type: formData.type,
        notes: formData.notes
      };
      
      onSave(newAppointment);
      setFormData({
        patientId: '',
        date: '',
        time: '',
        reason: '',
        type: 'consultation',
        duration: 30,
        notes: ''
      });
      onClose();
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData({...formData, type: value as 'consultation' | 'followup' | 'checkup' | 'emergency'});
  };

  return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent
      className="
        bg-white 
        sm:max-w-lg 
        w-[95%] 
        max-h-[90vh] 
        overflow-y-auto 
        rounded-xl 
        p-4 sm:p-6
        
      "
    >
      <DialogHeader>
        <DialogTitle className="flex items-center text-lg sm:text-xl font-semibol">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Nueva Cita
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paciente */}
        <div className="space-y-2 bg-white">
          <Label htmlFor="patient">Paciente *</Label>
          <Select
            value={formData.patientId}
            onValueChange={(value) =>
              setFormData({ ...formData, patientId: value })
            }
            required
          >
            <SelectTrigger className="w-full ">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Seleccionar paciente" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {mockPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Hora *</Label>
            <Select
              value={formData.time}
              onValueChange={(value) =>
                setFormData({ ...formData, time: value })
              }
              required
            >
              <SelectTrigger>
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Hora" />
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

        {/* Tipo de consulta */}
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Consulta</Label>
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consulta</SelectItem>
              <SelectItem value="followup">Seguimiento</SelectItem>
              <SelectItem value="checkup">Revisión</SelectItem>
              <SelectItem value="emergency">Urgencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duración */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duración (minutos)</Label>
          <Select
            value={formData.duration.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, duration: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">60 minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Motivo */}
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo de la Consulta *</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Describe el motivo de la consulta..."
            required
          />
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas Adicionales</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Notas adicionales (opcional)..."
          />
        </div>

          <div className=" space-x-8 pt-2">
            <Button type="submit" className="flex-1 medical-primary hover:bg-blue-400">
              Crear Cita
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}