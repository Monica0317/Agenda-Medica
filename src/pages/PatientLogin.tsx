import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function PatientLogin({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // 👉 Crear nuevo paciente
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Guardar datos del paciente en Firestore
        await setDoc(doc(db, "patients", user.uid), {
          fullname,
          phone,
          email,
          role: "patient",
          createdAt: new Date(),
        });

        alert("Cuenta creada correctamente. Ahora inicia sesión.");
        setIsRegister(false); // cambia a modo login
        setFullname("");
        setPhone("");
        setPassword("");
      } else {
        // 👉 Iniciar sesión del paciente
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
        navigate("/patient-portal");
      }
    } catch (err: any) {
      console.error("Error:", err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Credenciales inválidas o usuario no encontrado.");
      } else {
        setError("Error al procesar la solicitud. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-cyan-700 text-2xl font-bold">
            {isRegister ? "Crear cuenta de paciente" : "Iniciar sesión"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SOLO SE PIDE EN REGISTRO */}
            {isRegister && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <Input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-6 h-12 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>

            {error && (
              <p className="text-center text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isRegister ? "Registrarme" : "Ingresar"}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-cyan-700 hover:underline"
              >
                {isRegister ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>

            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="text-cyan-700 border-cyan-600 hover:bg-cyan-50"
              >
                ← Volver al inicio
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
