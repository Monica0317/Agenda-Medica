import { Clock, User, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/data/mockData';
import { formatTime } from '@/lib/dateUtils';

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails?: () => void;
}

const statusColors = {
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
};

export default function AppointmentCard({ appointment, onViewDetails }: AppointmentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(appointment.time)}
              </div>
            </div>
          </div>
          <Badge className={statusColors[appointment.status]}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <FileText className="w-4 h-4 mr-2" />
          {appointment.reason}
        </div>

        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewDetails}
          >
            Ver detalles
          </Button>
        )}
      </CardContent>
    </Card>
  );
}