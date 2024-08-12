// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCq8WS3kBa26ShwX_ToWKCD5AeAMUsR7rs",
  authDomain: "pantryapp-5309a.firebaseapp.com",
  projectId: "pantryapp-5309a",
  storageBucket: "pantryapp-5309a.appspot.com",
  messagingSenderId: "90653661646",
  appId: "1:90653661646:web:1fac4ccf59a60850be739f",
  measurementId: "G-69WB81XVLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);
export {app, firestore}