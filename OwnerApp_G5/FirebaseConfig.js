// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//import any services required from firebase
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBCAj1YR8jroIoIzG-pL535Wp-PdrFsgmE",
//   authDomain: "rentanthing-28dd4.firebaseapp.com",
//   projectId: "rentanthing-28dd4",
//   storageBucket: "rentanthing-28dd4.appspot.com",
//   messagingSenderId: "482782187348",
//   appId: "1:482782187348:web:063c7aff1a78ce43f742c1"
// };

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