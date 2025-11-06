import { useState } from 'react';
import { Save, User, Clock, Bell, Shield, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { mockDoctorSettings, DoctorSettings } from '@/data/mockData';

export default function Settings() {
  const [settings, setSettings] = useState<DoctorSettings>(mockDoctorSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Configuración guardada correctamente');
  };

  const updateSettings = (updates: Partial<DoctorSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateWorkingHours = (updates: Partial<DoctorSettings['workingHours']>) => {
    setSettings(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, ...updates }
    }));
  };

  const updateNotifications = (updates: Partial<DoctorSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates }
    }));
  };

  const toggleWorkingDay = (day: string) => {
    const currentDays = settings.workingHours.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    updateWorkingHours({ days: newDays });
  };

  const workingDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Gestiona la configuración de tu consulta</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="medical-primary hover:bg-blue-400"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => updateSettings({ name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={settings.specialty}
                onChange={(e) => updateSettings({ specialty: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license">Número de Colegiado</Label>
              <Input
                id="license"
                value={settings.license}
                onChange={(e) => updateSettings({ license: e.target.value })}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex">
                <Phone className="w-4 h-4 mt-3 mr-2 text-gray-500" />
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex">
                <Mail className="w-4 h-4 mt-3 mr-2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Trabajo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Horarios de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => updateWorkingHours({ start: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => updateWorkingHours({ end: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Días de Trabajo</Label>
              <div className="grid grid-cols-2 gap-2">
                {workingDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Switch
                      checked={settings.workingHours.days.includes(day)}
                      onCheckedChange={() => toggleWorkingDay(day)}
                    />
                    <Label className="text-sm">{day}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duración de Cita (minutos)</Label>
              <Select
                value={settings.appointmentDuration.toString()}
                onValueChange={(value) => updateSettings({ appointmentDuration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Notificaciones por Email</Label>
                <p className="text-sm text-gray-600">Recibir notificaciones en tu correo electrónico</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotifications({ email: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Notificaciones por SMS</Label>
                <p className="text-sm text-gray-600">Recibir notificaciones por mensaje de texto</p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => updateNotifications({ sms: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Recordatorios Automáticos</Label>
                <p className="text-sm text-gray-600">Enviar recordatorios automáticos a pacientes</p>
              </div>
              <Switch
                checked={settings.notifications.reminders}
                onCheckedChange={(checked) => updateNotifications({ reminders: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Ingresa una nueva contraseña"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirma la nueva contraseña"
              />
            </div>
            
            <Button variant="outline" className="w-full">
              Cambiar Contraseña
            </Button>
            
            <Separator />
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2">Backup de Datos</h4>
              <p className="text-sm text-amber-800 mb-3">
                Realiza una copia de seguridad de todos tus datos
              </p>
              <Button variant="outline" size="sm">
                Descargar Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}