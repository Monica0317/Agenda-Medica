import { useState } from 'react';
import { Users, Calendar, Clock, TrendingUp, Plus, Eye, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatCard from '@/components/StatCard';
import AppointmentCard from '@/components/AppointmentCard';
import NewAppointmentModal from '@/components/NewAppointmentModal';
import { mockAppointments, mockStats, Appointment } from '@/data/mockData';
import { formatDate } from '@/lib/dateUtils';

interface NavigationData {
  patientId?: string;
}

interface DashboardProps {
  onNavigate?: (section: string, data?: NavigationData) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date())
    .slice(0, 5);

  const handleNewAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const handleViewAllAppointments = () => {
    onNavigate?.('calendar');
  };

  const handleViewAllPatients = () => {
    onNavigate?.('patients');
  };

  const handleViewAppointmentDetails = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      onNavigate?.('patients', { patientId: appointment.patientId });
    }
  };

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
        <div onClick={handleViewAllPatients} className="cursor-pointer">
          <StatCard
            title="Total Pacientes"
            value={mockStats.totalPatients}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
        </div>
        <StatCard
          title="Citas Hoy"
          value={todayAppointments.length}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Asistencia Mensual"
          value={`${mockStats.monthlyAttendance}%`}
          icon={TrendingUp}
          color="purple"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Citas Pendientes"
          value={appointments.filter(apt => apt.status === 'pending').length}
          icon={Clock}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Próximas Citas</span>
                <Button variant="outline" size="sm" onClick={handleViewAllAppointments}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver todas
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onViewDetails={() => handleViewAppointmentDetails(appointment.id)}
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
          {/* Estadísticas de asistencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Asistencia Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {mockStats.monthlyAttendance}%
                  </div>
                  <Progress
                  value={mockStats.monthlyAttendance}
                  className="h-2 bg-gray-200 [&>[data-state=indeterminate]]:bg-cyan-400  [&>[data-state=complete]]:bg-cyan-400"
                />
               </div>
                <div className="text-sm text-gray-600 text-center">
                  {Math.round((mockStats.monthlyAttendance / 100) * appointments.length)} de {appointments.length} pacientes asistieron
                </div>
                
                {/* Gráfico semanal simple */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Citas por día</h4>
                  <div className="space-y-2">
                    {mockStats.weeklyStats.map((stat) => (
                      <div key={stat.day} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{stat.day}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-cyan-400 h-2 rounded-full" 
                              style={{ width: `${(stat.appointments / 15) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-6">
                            {stat.appointments}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recordatorios */}
          <Card>
            <CardHeader>
              <CardTitle>Recordatorios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Enviar recordatorios
                    </p>
                    <p className="text-xs text-blue-700">
                      {appointments.filter(apt => apt.status === 'confirmed' && 
                        new Date(apt.date).toDateString() === new Date(Date.now() + 86400000).toDateString()).length} pacientes para mañana
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                    Enviar
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">
                      Actualizar historiales
                    </p>
                    <p className="text-xs text-emerald-700">
                      {appointments.filter(apt => apt.status === 'confirmed' && 
                        new Date(apt.date) < new Date() && !apt.notes).length} pacientes pendientes
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-emerald-700 border-emerald-300"
                    onClick={() => onNavigate?.('patients')}
                  >
                    Revisar
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      Ingresos del mes
                    </p>
                    <p className="text-xs text-amber-700">
                      €{mockStats.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-amber-700 border-amber-300">
                    Ver más
                  </Button>
                </div>
              </div>
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
    </div>
  );
}