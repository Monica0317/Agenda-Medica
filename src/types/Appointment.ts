export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  email?: string;
  phone?: string;
  date: string;
  time: string;
  reason: string;
  specialty?: string;
  status: "pending" | "confirmed" | "cancelled";
  doctorId?: string;
  userId?: string;
  duration?: number;
  type: "consultation" | "followup" | "emergency" | "checkup";
}
