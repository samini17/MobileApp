// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//import any services required from firebase
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC6IileYxtY2BnDeEFt5dkFWuILVQgTmBs",
  authDomain: "finalprojectrentathing.firebaseapp.com",
  projectId: "finalprojectrentathing",
  storageBucket: "finalprojectrentathing.appspot.com",
  messagingSenderId: "628221148629",
  appId: "1:628221148629:web:8fb090f40021420b87115c"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

//instantiate firebase service
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

const db = getFirestore(app)

export {db}

//export auth service to be used in other files
export {auth}