export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  notes: string[];
  files: string[];
  address: string;
  emergencyContact: string;
  bloodType: string;
  allergies: string[];
  medicalHistory: string[];
}


export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  duration?:  number; 
  type: 'consultation' | 'followup' | 'emergency' | 'checkup';
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  type: 'patient' | 'system' | 'reminder';
}

export interface DoctorSettings {
  name: string;
  specialty: string;
  license: string;
  phone: string;
  email: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  appointmentDuration: number;
  notifications: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'María González López',
    age: 35,
    phone: '+34 612 345 678',
    email: 'maria.gonzalez@email.com',
    address: 'Calle Mayor 123, 28001 Madrid',
    emergencyContact: 'Juan González - +34 687 123 456',
    bloodType: 'A+',
    allergies: ['Penicilina', 'Polen'],
    lastVisit: '2024-10-15',
    notes: [
      'Hipertensión controlada con medicación',
      'Alergia a penicilina - usar alternativas',
      'Paciente colaboradora, sigue bien el tratamiento',
      'Revisión cada 3 meses recomendada'
    ],
    files: ['analisis_sangre_oct2024.pdf', 'radiografia_torax.jpg', 'electrocardiograma.pdf'],
    medicalHistory: [
      'Hipertensión arterial (2019)',
      'Fractura de muñeca (2018)',
      'Apendicectomía (2015)'
    ]
  },
  {
    id: '2',
    name: 'Carlos Rodríguez Martín',
    age: 42,
    phone: '+34 687 654 321',
    email: 'carlos.rodriguez@email.com',
    address: 'Avenida de la Paz 45, 28002 Madrid',
    emergencyContact: 'Ana Rodríguez - +34 654 987 321',
    bloodType: 'O-',
    allergies: ['Aspirina'],
    lastVisit: '2024-10-20',
    notes: [
      'Diabetes tipo 2 diagnosticada en 2020',
      'Control glucémico regular con metformina',
      'Necesita perder peso - dieta recomendada',
      'Ejercicio moderado 3 veces por semana'
    ],
    files: ['hemoglobina_glicosilada.pdf', 'plan_nutricional.pdf', 'glucometria_semanal.xlsx'],
    medicalHistory: [
      'Diabetes tipo 2 (2020)',
      'Colesterol alto (2019)',
      'Gastritis crónica (2017)'
    ]
  },
  {
    id: '3',
    name: 'Ana Martín Sánchez',
    age: 28,
    phone: '+34 654 987 321',
    email: 'ana.martin@email.com',
    address: 'Plaza España 12, 28003 Madrid',
    emergencyContact: 'Luis Martín - +34 612 456 789',
    bloodType: 'B+',
    allergies: [],
    lastVisit: '2024-10-25',
    notes: [
      'Embarazo de 12 semanas - evolución normal',
      'Ácido fólico y vitaminas prenatales',
      'Próxima ecografía programada',
      'Sin complicaciones hasta la fecha'
    ],
    files: ['/images/12weekspregnancy.jpg', 'analisis_primer_trimestre.pdf', 'historial_prenatal.pdf'],
    medicalHistory: [
      'Embarazo actual (2024)',
      'Migraña ocasional (2022)'
    ]
  },
  {
    id: '4',
    name: 'José Luis Fernández',
    age: 58,
    phone: '+34 698 765 432',
    email: 'joseluis.fernandez@email.com',
    address: 'Calle Serrano 78, 28006 Madrid',
    emergencyContact: 'Carmen Fernández - +34 645 123 789',
    bloodType: 'AB+',
    allergies: ['Yodo', 'Mariscos'],
    lastVisit: '2024-10-18',
    notes: [
      'Hipertensión y colesterol alto',
      'Fumador - programa de cesación tabáquica',
      'Control cardiológico anual recomendado',
      'Medicación: Enalapril y Atorvastatina'
    ],
    files: ['electrocardiograma_oct2024.pdf', 'analisis_lipidos.pdf', 'rx_torax.jpg'],
    medicalHistory: [
      'Hipertensión arterial (2018)',
      'Dislipidemia (2019)',
      'Tabaquismo (desde 1985)'
    ]
  },
  {
    id: '5',
    name: 'Carmen Ruiz Moreno',
    age: 67,
    phone: '+34 634 567 890',
    email: 'carmen.ruiz@email.com',
    address: 'Calle Alcalá 234, 28028 Madrid',
    emergencyContact: 'Pedro Ruiz - +34 678 234 567',
    bloodType: 'O+',
    allergies: ['Sulfonamidas'],
    lastVisit: '2024-10-22',
    notes: [
      'Artritis reumatoide en tratamiento',
      'Osteoporosis - suplementos de calcio',
      'Revisiones cada 2 meses',
      'Fisioterapia recomendada'
    ],
    files: ['densitometria_osea.pdf', 'analisis_reumatologicos.pdf', '/images/RheumatoidArthritis.jpg'],
    medicalHistory: [
      'Artritis reumatoide (2020)',
      'Osteoporosis (2021)',
      'Histerectomía (2010)'
    ]
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'María González López',
    date: '2024-11-05',
    time: '09:00',
    reason: 'Control hipertensión arterial',
    status: 'confirmed',
    duration: 30,
    type: 'followup',
    notes: 'Revisar tensión arterial y ajustar medicación si es necesario'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Carlos Rodríguez Martín',
    date: '2024-11-05',
    time: '10:30',
    reason: 'Control diabetes - revisión glucemia',
    status: 'confirmed',
    duration: 45,
    type: 'followup',
    notes: 'Revisar hemoglobina glicosilada y plan nutricional'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Ana Martín Sánchez',
    date: '2024-11-05',
    time: '12:00',
    reason: 'Control prenatal - semana 14',
    status: 'pending',
    duration: 30,
    type: 'checkup',
    notes: 'Ecografía y análisis segundo trimestre'
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'José Luis Fernández',
    date: '2024-11-05',
    time: '16:00',
    reason: 'Revisión cardiológica',
    status: 'confirmed',
    duration: 45,
    type: 'consultation',
    notes: 'Electrocardiograma y revisión medicación cardiovascular'
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Carmen Ruiz Moreno',
    date: '2024-11-06',
    time: '09:30',
    reason: 'Control artritis reumatoide',
    status: 'confirmed',
    duration: 30,
    type: 'followup'
  },
  {
    id: '6',
    patientId: '1',
    patientName: 'María González López',
    date: '2024-11-06',
    time: '11:00',
    reason: 'Revisión general anual',
    status: 'pending',
    duration: 60,
    type: 'checkup'
  },
  {
    id: '7',
    patientId: '2',
    patientName: 'Carlos Rodríguez Martín',
    date: '2024-11-07',
    time: '10:00',
    reason: 'Resultados análisis laboratorio',
    status: 'confirmed',
    duration: 30,
    type: 'consultation'
  },
  {
    id: '8',
    patientId: '3',
    patientName: 'Ana Martín Sánchez',
    date: '2024-11-08',
    time: '11:30',
    reason: 'Ecografía morfológica',
    status: 'pending',
    duration: 45,
    type: 'checkup'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    from: 'María González López',
    subject: 'Consulta sobre medicación',
    content: 'Doctor, tengo una duda sobre la nueva medicación que me recetó. ¿Puedo tomarla con el desayuno?',
    date: '2024-11-04',
    read: false,
    type: 'patient'
  },
  {
    id: '2',
    from: 'Sistema',
    subject: 'Recordatorio: Citas de mañana',
    content: 'Tiene 4 citas programadas para mañana. Se han enviado recordatorios automáticos a todos los pacientes.',
    date: '2024-11-04',
    read: true,
    type: 'system'
  },
  {
    id: '3',
    from: 'Carlos Rodríguez Martín',
    subject: 'Reagendar cita',
    content: 'Buenos días doctor, necesito reagendar mi cita del viernes por un compromiso laboral. ¿Sería posible el lunes siguiente?',
    date: '2024-11-03',
    read: false,
    type: 'patient'
  },
  {
    id: '4',
    from: 'Sistema',
    subject: 'Recordatorio: Renovar licencia médica',
    content: 'Su licencia médica vence en 30 días. Recuerde iniciar el proceso de renovación.',
    date: '2024-11-02',
    read: true,
    type: 'reminder'
  }
];



export const mockDoctorSettings: DoctorSettings = {
  name: 'Dr. Roberto García Mendoza',
  specialty: 'Medicina General',
  license: 'COL-28-123456789',
  phone: '+34 912 345 678',
  email: 'dr.garcia@clinica.com',
  workingHours: {
    start: '09:00',
    end: '18:00',
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  },
  appointmentDuration: 30,
  notifications: {
    email: true,
    sms: true,
    reminders: true
  }
};