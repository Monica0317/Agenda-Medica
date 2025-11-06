import { useState } from "react";
import { Calendar, Users, MessageSquare, BarChart3, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Imagen from "@/assets/imagen.png";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "calendar", label: "Agenda", icon: Calendar },
  { id: "patients", label: "Pacientes", icon: Users },
  { id: "messages", label: "Mensajes", icon: MessageSquare },
  { id: "settings", label: "Configuración", icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header con botón de colapsar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={Imagen}
            alt="icono"
            className={cn("object-contain transition-all duration-300", collapsed ? "w-8 h-8" : "w-12 h-10")}
          />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">MedConnect</h1>
              <p className="text-sm text-gray-500">Gestión Médica</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-2 space-y-2">
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
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Info del usuario */}
      <div className="p-4 border-t border-gray-200">
        <Button>
          
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">DR</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Dr. García</p>
              <p className="text-xs text-gray-500">Medicina General</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
