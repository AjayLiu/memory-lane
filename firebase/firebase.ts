import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDhnTdptNOgIvRs_AVmlfu3w8Hng-zMQ8M",
	authDomain: "memory-lane-2fbf2.firebaseapp.com",
	projectId: "memory-lane-2fbf2",
	storageBucket: "memory-lane-2fbf2.appspot.com",
	messagingSenderId: "594344232267",
	appId: "1:594344232267:web:13c8fa8d943aa3589194ce",
	measurementId: "G-LVXFX0X6JE"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
