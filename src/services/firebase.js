// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDruGObTm-8aAbIxwSf8rKkE-J3Zf8Gad0",
  authDomain: "beefit-e0b4c.firebaseapp.com",
  projectId: "beefit-e0b4c",
  storageBucket: "beefit-e0b4c.appspot.com",
  messagingSenderId: "106797919536",
  appId: "1:106797919536:web:0251f865a9532252b8acf5",
  measurementId: "G-1N4DC73VFJ"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };