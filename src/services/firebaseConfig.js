import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD15-RhozV9BGNSS6EK87puhv-i5oKxE2o",
  authDomain: "glucmt-yaga.firebaseapp.com",
  projectId: "glucmt-yaga",
  storageBucket: "glucmt-yaga.firebasestorage.app",
  messagingSenderId: "1063039294676",
  appId: "1:1063039294676:web:333dcd02d7094eb7876f41",
  measurementId: "G-9GTD7NJ4T4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Fix para el problema de WebSockets congelados en React Native (y tolerar recargas de pantalla)
export let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  });
} catch (error) {
  // Si recargamos con 'r', Firebase ya estaba iniciado, así que simplemente lo recuperamos
  db = getFirestore(app);
}

// Función auxiliar para subir lecturas médicas a la nube
export const saveReadingToCloud = async (type, data) => {
  console.log(`Intentando subir a Firebase la medición de ${type}...`);
  try {
    const docRef = await addDoc(collection(db, "mediciones"), {
      tipo: type, // "BLOOD_PRESSURE" o "GLUCOSE"
      datos: data, // ej: {sys: 120, dia: 80}
      fecha: serverTimestamp(),
      paciente: "Papá" // Aquí puedes poner el nombre de tu papá
    });
    console.log("☁️ ¡Dato guardado en la Nube con éxito! ID del documento:", docRef.id);
  } catch (e) {
    console.error("Error guardando en la Nube:", e);
  }
};
