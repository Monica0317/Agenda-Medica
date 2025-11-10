import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

import PublicLanding from "@/pages/PublicLanding";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import PatientPortal from "@/pages/PatientPortal";
import PatientLogin from "@/pages/PatientLogin";
import Messages from "@/pages/Messages";
import Calendar from "@/pages/Calendar";
import PatientProfile from "@/pages/PatientProfile";
import Settings from "@/pages/Settings";
import DashboardLayout from "@/layouts/DashboardLayout";
import PatientsList from "@/pages/PatientsList";


const queryClient = new QueryClient();

export default function App() {
  const [isProLoggedIn, setIsProLoggedIn] = useState(false);
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario profesional está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsProLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            {/* Landing pública */}
            <Route path="/" element={<PublicLanding />} />

            {/* Login y registro */}
            <Route path="/login" element={<Login onLogin={() => setIsProLoggedIn(true)} />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dashboard del doctor */}
            <Route
              path="/dashboard"
              element={
                isProLoggedIn ? <DashboardLayout /> : <Navigate to="/login" replace />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="patients" element={<PatientsList />} />
              <Route path="patients/:id" element={<PatientProfile />} />

              <Route path="patients" element={<PatientProfile />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Portal del paciente */}
            <Route
              path="/patient-portal"
              element={
                isPatientLoggedIn ? (
                  <PatientPortal />
                ) : (
                  <Navigate to="/patient-login" replace />
                )
              }
            />
            <Route
              path="/patient-login"
              element={<PatientLogin onLogin={() => setIsPatientLoggedIn(true)} />}
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
