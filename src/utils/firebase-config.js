import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyDDC2ZwJpXkvprO-VL6BAyfdCv3Mj4BLUk",
  authDomain: "netflix-clone-f13ad.firebaseapp.com",
  projectId: "netflix-clone-f13ad",
  storageBucket: "netflix-clone-f13ad.appspot.com",
  messagingSenderId: "121085747134",
  appId: "1:121085747134:web:a0829bbceb0d28cc3ee3ef",
  measurementId: "G-JDRLMNZRQJ"
};


const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);