import { useState, useEffect } from "react";
import {
  Save,
  User,
  Clock,
  Bell,
  Shield,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";

interface DoctorSettings {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  appointmentDuration: number;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
  [key: string]: any;
}

export default function Settings() {
  const [settings, setSettings] = useState<DoctorSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<DoctorSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  // Campos de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Cargar datos del doctor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "doctors", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedData: DoctorSettings = {
            name: data.nombre || "",
            specialty: data.specialty || "",
            license: data.cedula || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
            appointmentDuration: data.appointmentDuration || 30,
            workingHours: data.workingHours || {
              start: "08:00",
              end: "17:00",
              days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            },
            notifications: data.notifications || {
              email: true,
              sms: false,
              reminders: true,
            },
          };
          setSettings(loadedData);
          setOriginalSettings(loadedData);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Detectar cambios
  useEffect(() => {
    if (!settings || !originalSettings) return;
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  // Guardar configuración
  const handleSave = async () => {
    if (!uid || !settings) return;
    setIsSaving(true);
    try {
      const cleanSettings = JSON.parse(
        JSON.stringify(settings, (key, value) => (value === undefined ? null : value))
      );

      const docRef = doc(db, "doctors", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, cleanSettings);
      } else {
        await setDoc(docRef, cleanSettings);
      }

      setOriginalSettings(settings);
      setHasChanges(false);
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return alert("Error: no hay usuario autenticado");
    if (!currentPassword || !newPassword || !confirmPassword)
      return alert("Completa todos los campos");
    if (newPassword !== confirmPassword)
      return alert("Las contraseñas nuevas no coinciden");
    if (newPassword.length < 6)
      return alert("La nueva contraseña debe tener al menos 6 caracteres");

    try {
      setPasswordLoading(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error);
      if (error.code === "auth/wrong-password")
        alert("La contraseña actual es incorrecta");
      else alert("No se pudo cambiar la contraseña");
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateSettings = (updates: Partial<DoctorSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...updates } : prev));

  const updateWorkingHours = (updates: Partial<DoctorSettings["workingHours"]>) =>
    setSettings((prev) =>
      prev ? { ...prev, workingHours: { ...prev.workingHours, ...updates } } : prev
    );

  const updateNotifications = (updates: Partial<DoctorSettings["notifications"]>) =>
    setSettings((prev) =>
      prev ? { ...prev, notifications: { ...prev.notifications, ...updates } } : prev
    );

  const toggleWorkingDay = (day: string) => {
    if (!settings) return;
    const currentDays = settings.workingHours.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    updateWorkingHours({ days: newDays });
  };

  const workingDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  if (loading || !settings)
    return <div className="p-6 text-gray-600">Cargando configuración...</div>;

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
          disabled={!hasChanges || isSaving}
          className={`${
            hasChanges
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          } text-white`}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Guardando..." : hasChanges ? "Guardar Cambios" : "Sin Cambios"}
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
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500">El email no puede modificarse</p>
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
                onValueChange={(value) =>
                  updateSettings({ appointmentDuration: parseInt(value) })
                }
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
                <p className="text-sm text-gray-600">
                  Recibir notificaciones en tu correo electrónico
                </p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  updateNotifications({ email: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Notificaciones por SMS</Label>
                <p className="text-sm text-gray-600">
                  Recibir notificaciones por mensaje de texto
                </p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={(checked) =>
                  updateNotifications({ sms: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Recordatorios Automáticos</Label>
                <p className="text-sm text-gray-600">
                  Enviar recordatorios automáticos a pacientes
                </p>
              </div>
              <Switch
                checked={settings.notifications.reminders}
                onCheckedChange={(checked) =>
                  updateNotifications({ reminders: checked })
                }
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
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa una nueva contraseña"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma la nueva contraseña"
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={passwordLoading}
              onClick={handleChangePassword}
            >
              {passwordLoading ? "Actualizando..." : "Cambiar Contraseña"}
            </Button>

            <Separator />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2">
                Backup de Datos
              </h4>
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
