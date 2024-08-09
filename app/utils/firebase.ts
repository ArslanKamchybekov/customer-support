// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3oUFsAr5QoyDcu-pQU4wtitbI57n2SRc",
  authDomain: "customer-support-33008.firebaseapp.com",
  projectId: "customer-support-33008",
  storageBucket: "customer-support-33008.appspot.com",
  messagingSenderId: "133568038105",
  appId: "1:133568038105:web:9735e37cf8f6435cb8eac8",
  measurementId: "G-XXPVWF9SLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };