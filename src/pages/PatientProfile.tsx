import { useState } from 'react';
import { ArrowLeft, Phone, Mail, Calendar, FileText, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { mockPatients, mockAppointments } from '@/data/mockData';
import { formatDate, formatDateTime } from '@/lib/dateUtils';

interface PatientProfileProps {
  patientId?: string;
  onBack: () => void;
}

export default function PatientProfile({ patientId = '1', onBack }: PatientProfileProps) {
  const [newNote, setNewNote] = useState('');
  
  const patient = mockPatients.find(p => p.id === patientId);
  const patientAppointments = mockAppointments.filter(apt => apt.patientId === patientId);

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Paciente no encontrado</p>
          <Button onClick={onBack} className="mt-4">Volver</Button>
        </div>
      </div>
    );
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Aquí se agregaría la nota al historial
      console.log('Nueva nota:', newNote);
      setNewNote('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600">Perfil del paciente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información personal */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-gray-600">{patient.age} años</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{patient.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Última visita: {formatDate(patient.lastVisit)}
                  </span>
                </div>
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
              <div className="space-y-2">
                {patient.files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">{file}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial y notas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historial de citas */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {formatDateTime(appointment.date, appointment.time)}
                      </span>
                      <Badge className={
                        appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {appointment.status === 'confirmed' ? 'Confirmada' :
                         appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{appointment.reason}</p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notas médicas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Médicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notas existentes */}
              <div className="space-y-3">
                {patient.notes.map((note, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900">{note}</p>
                  </div>
                ))}
              </div>

              {/* Agregar nueva nota */}
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Agregar nueva nota o diagnóstico..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button onClick={handleAddNote} className="medical-primary hover:bg-blue-400">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}