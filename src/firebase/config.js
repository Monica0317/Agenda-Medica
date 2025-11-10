// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ✅ faltaba esta línea

const firebaseConfig = {
  apiKey: "AIzaSyDrmoQq5yTudbzbKexB6Hwc9elYN8qCazY",
  authDomain: "agenda-medica-d28e2.firebaseapp.com",
  projectId: "agenda-medica-d28e2",
  storageBucket: "agenda-medica-d28e2.appspot.com", // ✅ corregido ".app" → ".appspot.com"
  messagingSenderId: "453240632113",
  appId: "1:453240632113:web:f958b9492ecee0af4eb610",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
