import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/data/mockData';
import { getWeekDates, getDayName, formatDate, isSameDay } from '@/lib/dateUtils';

interface CalendarViewProps {
  appointments: Appointment[];
  onNewAppointment?: () => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export default function CalendarView({ appointments, onNewAppointment, onAppointmentClick }: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekDates = getWeekDates(currentWeek);

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    });
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusLabels = {
    confirmed: 'C',
    pending: 'P',
    cancelled: 'X',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agenda Semanal</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <span className="text-sm font-medium px-4">
              {formatDate(weekDates[0].toISOString())} - {formatDate(weekDates[6].toISOString())}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            {onNewAppointment && (
              <Button onClick={onNewAppointment} className="ml-4 medical-primary hover:bg-blue-400">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayAppointments = getAppointmentsForDay(date);
            const isToday = isSameDay(date, new Date());
            const isPast = date < new Date() && !isToday;
            
            return (
              <div key={index} className="min-h-[250px]">
                <div className={`p-3 rounded-lg border-2 transition-colors ${
                  isToday ? 'border-cyan-400 bg-cyan-50' : 
                  isPast ? 'border-gray-200 bg-gray-50' :
                  'border-gray-200 bg-white hover:border-gray-300'
                } min-h-[250px]`}>
                  <div className="text-center mb-3">
                    <p className={`text-sm font-medium ${
                      isToday ? 'text-cyan-700' : 
                      isPast ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {getDayName(date)}
                    </p>
                    <p className={`text-lg font-bold ${
                      isToday ? 'text-cyan-900' : 
                      isPast ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-2 rounded border cursor-pointer transition-all hover:shadow-sm ${
                          isPast ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => onAppointmentClick?.(appointment)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${
                            isPast ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {appointment.time}
                          </span>
                          <Badge className={`text-xs ${
                            isPast ? 'bg-gray-200 text-gray-600' : statusColors[appointment.status]
                          }`}>
                            {statusLabels[appointment.status]}
                          </Badge>
                        </div>
                        <p className={`text-xs truncate mb-1 ${
                          isPast ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {appointment.patientName}
                        </p>
                        <p className={`text-xs truncate ${
                          isPast ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {appointment.reason}
                        </p>
                        <div className={`text-xs mt-1 ${
                          isPast ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {appointment.duration}min
                        </div>
                      </div>
                    ))}
                    
                    {/* Botón para agregar cita en día específico */}
                    {!isPast && onNewAppointment && (
                      <button
                        onClick={() => onNewAppointment()}
                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-colors text-xs"
                      >
                        + Agregar cita
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Leyenda */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Badge className="bg-emerald-100 text-emerald-800">C</Badge>
            <span className="text-sm text-gray-600">Confirmada</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-amber-100 text-amber-800">P</Badge>
            <span className="text-sm text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-red-100 text-red-800">X</Badge>
            <span className="text-sm text-gray-600">Cancelada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}