import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import {  Users } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lastVisit?: string;
  bloodType?: string;
  allergies?: string[];
  notes?: string[];
  files?: string[];
}

export default function PatientsList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfirmedPatients = async () => {
      try {
        const confirmedQuery = query(
          collection(db, "appointments"),
          where("status", "==", "confirmed")
        );
        const confirmedSnap = await getDocs(confirmedQuery);

        const patientsMap: Record<string, Patient> = {};

        confirmedSnap.forEach((doc) => {
          const data = doc.data() as any;
          const pid = data.patientId || data.userId || doc.id;

          if (!patientsMap[pid]) {
            patientsMap[pid] = {
              id: pid,
              name: data.patientName || data.name || "Paciente sin nombre",
              email: data.email || "",
              phone: data.phone || "",
              lastVisit: data.date || "",
              files: [],
              notes: [],
            };
          }
        });

        setPatients(Object.values(patientsMap));
      } catch (error) {
        console.error("Error al obtener pacientes confirmados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedPatients();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Cargando pacientes...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">Pacientes con citas aceptadas</p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay pacientes con citas confirmadas aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => navigate(`/dashboard/patients/${patient.id}`)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {patient.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                )}
                {patient.lastVisit && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Última cita:</span>
                    <span className="font-medium">
                      {new Date(patient.lastVisit).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <div className="flex-1 bg-blue-50 rounded px-2 py-1">
                  <p className="text-xs text-blue-800 font-medium">
                    {patient.notes?.length || 0} notas médicas
                  </p>
                </div>
                <div className="flex-1 bg-emerald-50 rounded px-2 py-1">
                  <p className="text-xs text-emerald-800 font-medium">
                    {patient.files?.length || 0} archivos
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
