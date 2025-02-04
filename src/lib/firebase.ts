import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDyTR6f1_EbzUVYo3ele6TeYbMngfgSi0E",
  authDomain: "performedge-bd2cb.firebaseapp.com",
  projectId: "performedge-bd2cb",
  storageBucket: "performedge-bd2cb.firebasestorage.app",
  messagingSenderId: "348544853009",
  appId: "1:348544853009:web:7f4912ab6c9bda949cfdb0",
  measurementId: "G-8J0EL5RHCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with specific settings
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Use the device's language

// Initialize Google Auth Provider with custom parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Always prompt for account selection
});