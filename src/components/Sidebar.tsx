import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";
import { Calendar, Users, MessageSquare, BarChart3, Settings, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Imagen from "@/assets/imagen.png";
import { cn } from "@/lib/utils";
import { auth, db } from "@/firebase/config";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  doctor?: any;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { id: "calendar", label: "Agenda", icon: Calendar, path: "/dashboard/calendar" },
  { id: "patients", label: "Pacientes", icon: Users, path: "/dashboard/patients" },
  { id: "messages", label: "Mensajes", icon: MessageSquare, path: "/dashboard/messages" },
  { id: "settings", label: "Configuración", icon: Settings, path: "/dashboard/settings" },
];

export default function Sidebar({ activeSection, onSectionChange, doctor: doctorProp }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [doctorData, setDoctorData] = useState<{ nombre: string; specialty: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      if (doctorProp) {
        setDoctorData({
          nombre: doctorProp.nombre || "Sin nombre",
          specialty: doctorProp.specialty || "Sin especialidad",
        });
        return;
      }

      const user = auth.currentUser;
      if (!user?.email) return;

      const q = query(collection(db, "doctors"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setDoctorData({
          nombre: data.nombre || "Sin nombre",
          specialty: data.specialty || "Sin especialidad",
        });
      }
    };

    fetchDoctor();
  }, [doctorProp]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div
        className={cn(
          "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-45"
        )}
      >
            {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={Imagen} alt="icono" className={cn("object-contain", collapsed ? "w-8 h-8" : "w-12 h-10")} />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">MedConnect</h1>
              <p className="text-sm text-gray-500">Gestión Médica</p>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full flex items-center justify-start h-12 px-3",
                isActive
                  ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-400"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => {
                onSectionChange(item.id);
                navigate(item.path);
              }}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full mb-3 flex items-center justify-center text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && "Cerrar sesión"}
        </Button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {doctorData?.nombre?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {doctorData?.nombre || "Doctor sin nombre"}
              </p>
              <p className="text-xs text-gray-500">
                {doctorData?.specialty || "Sin especialidad"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
