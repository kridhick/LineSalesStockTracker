// services/firebase.ts
// FIX: Using scoped package import for firebase/app to resolve module export errors.
import { initializeApp } from "@firebase/app";
// FIX: Using scoped package import for firebase/firestore to resolve module export errors.
import { getFirestore } from "@firebase/firestore";

// Your web app's Firebase configuration from the original Login.tsx
// IMPORTANT: Ensure this configuration is correct and that your Firestore database is set up.
const firebaseConfig = {
  apiKey: "AIzaSyAKvCs2NncAgmzb4FuCxyGEOH7TXsu3z1U",
  authDomain: "linesalesstocktracker.firebaseapp.com",
  projectId: "linesalesstocktracker",
  storageBucket: "linesalesstocktracker.firebasestorage.app",
  messagingSenderId: "341648105496",
  appId: "1:341648105496:web:61c20d61b150160d6d236d",
  measurementId: "G-PT7FREE4CE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
