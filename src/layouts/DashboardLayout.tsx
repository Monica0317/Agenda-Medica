import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [doctor, setDoctor] = useState<any>(null);
  const location = useLocation();

  // Detectar sección activa por URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/calendar")) setActiveSection("calendar");
    else if (path.includes("/patients")) setActiveSection("patients");
    else if (path.includes("/messages")) setActiveSection("messages");
    else if (path.includes("/settings")) setActiveSection("settings");
    else setActiveSection("dashboard");
  }, [location.pathname]);

  // Obtener datos del doctor logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "doctors", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setDoctor(docSnap.data());
      } else {
        setDoctor(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        doctor={doctor}
      />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
