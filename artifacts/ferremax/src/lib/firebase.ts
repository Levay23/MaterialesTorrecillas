import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpTW7fZYROqc2Gcv6762EknUS-SRvwzAU",
  authDomain: "materiales-torrecillas.firebaseapp.com",
  projectId: "materiales-torrecillas",
  storageBucket: "materiales-torrecillas.firebasestorage.app",
  messagingSenderId: "27750686375",
  appId: "1:27750686375:web:6772b42cd6010fcbc8c582",
  measurementId: "G-26Y1QGWMXS"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
