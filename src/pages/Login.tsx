import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Imagen from '@/assets/imagen.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de login
    if (credentials.username && credentials.password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-1">
           <div className="inline-flex items-center justify-center ">
          <img
            src={Imagen}
            alt="icono"
            className="w-20 h-30 object-contain"
          />
        </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MedConnect</h1>
          <p className="text-gray-600">Gestión profesional de consultorios médicos</p>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-25">
            <CardTitle className="text-2xl text-center text-gray-900">
              Iniciar Sesión
            </CardTitle>
            <p className="text-center text-gray-600">
              Ingresa tus credenciales para acceder
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
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

              <Button
                type="submit"
                className="w-full h-12 medical-primary text-lg font-medium"
              >
                Ingresar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="link" className="text-cyan-600 hover:text-cyan-700">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ilustración médica */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Sistema seguro y confiable</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
}