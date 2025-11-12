import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Imagen from "@/assets/imagen.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    cedula: "",
    email: "",
    password: "",
    specialty: "",
  });

  const specialties = [
    "Medicina General",
    "Pediatría",
    "Cardiología",
    "Dermatología",
    "Ginecología",
    "Traumatología",
    "Neurología",
    "Psiquiatría",
    "Oftalmología",
    "Odontología",
    "Endocrinología",
    "Otorrinolaringología",
    "Medicina Interna",
    "Urología",
    "Oncología",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "doctors", user.uid), {
        nombre: form.nombre,
        cedula: form.cedula,
        email: form.email,
        specialty: form.specialty,
        rol: "doctor",
        createdAt: new Date(),
      });

      await updateProfile(user, { displayName: form.nombre });
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Error al crear la cuenta. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-2">
          <img src={Imagen} alt="logo" className="w-20 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-gray-600">
            Únete a <span className="font-semibold text-cyan-700">MedConnect</span> y gestiona tus pacientes fácilmente
          </p>
        </div>

        {/* Tarjeta */}
        <Card className="shadow-xl border-0 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-gray-900 text-2xl">
              Registro de Profesional
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Dr. Juan Pérez"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Cédula */}
              <div>
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  type="text"
                  placeholder= "Ejemplo: 123456789"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Especialización */}
              <div className="flex flex-col space-y-1">
              <Label htmlFor="specialty">Especialización</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-between w-full h-12 px-3 border border-black rounded-md"
                    )}
                    onClick={() => setOpen(!open)}
                  >
                    <span className={cn("truncate", !form.specialty && "text-gray-500")}>
                      {form.specialty || "Selecciona o busca una especialidad"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] p-0 bg-white border border-gray-200 shadow-md rounded-md">
                  <Command>
                    <CommandInput
                      placeholder="Buscar especialidad..."
                      className="bg-white border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <CommandList className="bg-white">
                      <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                      {specialties.map((specialty) => (
                        <CommandItem
                          key={specialty}
                          value={specialty}
                          onSelect={() => {
                            setForm({ ...form, specialty });
                            setOpen(false);
                          }}
                          className="cursor-pointer transition-all duration-100 hover:bg-gray-100 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-cyan-600 transition-opacity",
                              form.specialty === specialty ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {specialty}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>



              {/* Correo */}
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Contraseña */}
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Errores */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Botón */}
              <Button
                type="submit"
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-medium"
              >
                Registrarme
              </Button>

              <p className="text-center text-sm text-gray-600 mt-3">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-cyan-600 hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
