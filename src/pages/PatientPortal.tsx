import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockAppointments } from '@/data/mockData';
import { formatDateTime } from '@/lib/dateUtils';

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    reason: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Simulamos citas del paciente actual
  const patientAppointments = mockAppointments.slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la solicitud de cita
    console.log('Solicitud de cita:', appointmentForm);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setAppointmentForm({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        reason: ''
      });
    }, 3000);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '16:00', '16:30', '17:00', '17:30'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal del Paciente - MedConnect</h1>
              <p className="text-gray-600">Dr. García - Medicina General</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <Button
            variant={activeTab === 'request' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'request' ? 'medical-primary' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Solicitar Cita
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'history' ? 'medical-primary' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Mis Citas
          </Button>
        </div>

        {activeTab === 'request' && (
          <div className="space-y-6">
            {isSubmitted ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                    ¡Solicitud Enviada!
                  </h3>
                  <p className="text-emerald-700 mb-4">
                    Tu solicitud de cita ha sido enviada correctamente. Te contactaremos pronto para confirmar.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      <strong>Recordatorio:</strong> Recibirás una confirmación por email y SMS
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Nueva Cita</CardTitle>
                  <p className="text-gray-600">
                    Completa el formulario para solicitar una cita médica
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo *</Label>
                        <Input
                          id="name"
                          value={appointmentForm.name}
                          onChange={(e) => setAppointmentForm({...appointmentForm, name: e.target.value})}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={appointmentForm.phone}
                          onChange={(e) => setAppointmentForm({...appointmentForm, phone: e.target.value})}
                          placeholder="+34 600 000 000"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={appointmentForm.email}
                        onChange={(e) => setAppointmentForm({...appointmentForm, email: e.target.value})}
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha Preferida *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora Preferida *</Label>
                        <Select
                          value={appointmentForm.time}
                          onValueChange={(value) => setAppointmentForm({...appointmentForm, time: value})}
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

                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo de la Consulta *</Label>
                      <Textarea
                        id="reason"
                        value={appointmentForm.reason}
                        onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                        placeholder="Describe brevemente el motivo de tu consulta..."
                        className="min-h-[100px]"
                        required
                      />
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

        {activeTab === 'history' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Citas</CardTitle>
                <p className="text-gray-600">
                  Historial de tus citas médicas
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
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
                        <Badge className={
                          appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                        </Badge>
                      </div>
                      
                      {appointment.status === 'confirmed' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                          <p className="text-sm text-emerald-800">
                            <strong>Recordatorio:</strong> No olvides llegar 10 minutos antes de tu cita
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Información de contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <p className="text-gray-600">+34 912 345 678</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">consulta@medconnect.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}