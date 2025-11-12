import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Imagen from "@/assets/imagen.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    cedula: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = userCredential.user;

      const doctorsRef = collection(db, "doctors");
      const q = query(
        doctorsRef,
        where("email", "==", user.email),
        where("cedula", "==", credentials.cedula)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError(
          "No tienes permisos para acceder o la cédula no coincide."
        );
        await auth.signOut();
        return;
      }

      onLogin();
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error en login:", err.message);
      setError("Credenciales incorrectas o usuario no registrado.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-1">
          <div className="inline-flex items-center justify-center">
            <img src={Imagen} alt="icono" className="w-20 h-30 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MedConnect</h1>
          <p className="text-gray-600">
            Gestión profesional de consultorios médicos
          </p>
        </div>

        {/* Tarjeta */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-25">
            <CardTitle className="text-2xl text-center text-gray-900">
              Iniciar Sesión
            </CardTitle>
            <p className="text-center text-gray-600">
              Ingresa tus credenciales
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 🪪 Cédula */}
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  type="text"
                  placeholder="Número de identificación"
                  value={credentials.cedula}
                  onChange={(e) =>
                    setCredentials({ ...credentials, cedula: e.target.value })
                  }
                  className="h-12"
                  required
                />
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="h-12"
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    className="h-12 pr-12"
                    required
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

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Botón */}
              <Button
                type="submit"
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-medium"
              >
                Ingresar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-cyan-600 hover:text-cyan-700"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
