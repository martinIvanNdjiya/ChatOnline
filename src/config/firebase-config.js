// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD4ZZhisOz62VJp1JZFrEi0l-HcJmAZO4M",
    authDomain: "chatenligne-965de.firebaseapp.com",
    projectId: "chatenligne-965de",
    storageBucket: "chatenligne-965de.appspot.com",
    messagingSenderId: "444392720350",
    appId: "1:444392720350:web:44afddab3bb4b106cc3f4f"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app)

export { db, storage, auth };