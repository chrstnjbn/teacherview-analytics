
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDyTR6f1_EbzUVYo3ele6TeYbMngfgSi0E",
  authDomain: "performedge-bd2cb.firebaseapp.com",
  projectId: "performedge-bd2cb",
  storageBucket: "performedge-bd2cb.firebasestorage.app",
  messagingSenderId: "348544853009",
  appId: "1:348544853009:web:7f4912ab6c9bda949cfdb0",
  measurementId: "G-8J0EL5RHCC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.useDeviceLanguage(); 

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' 
});

export const db = getFirestore(app);

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  FEEDBACK: 'feedback',
};
