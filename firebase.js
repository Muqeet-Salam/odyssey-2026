// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkzPT5j1gID26UYm53G6PCvnK6vroqnO8",
  authDomain: "odyssey-ce918.firebaseapp.com",
  databaseURL: "https://odyssey-ce918-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "odyssey-ce918",
  storageBucket: "odyssey-ce918.firebasestorage.app",
  messagingSenderId: "54389600622",
  appId: "1:54389600622:web:29e12fddeb4c244f3b117f",
  measurementId: "G-V653MTW3PR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };