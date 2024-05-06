import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBVQCCOnknocKiF9YUfgRZv8F7bPuBYMS8",
    authDomain: "budgt-ly.firebaseapp.com",
    projectId: "budgt-ly",
    storageBucket: "budgt-ly.appspot.com",
    messagingSenderId: "1015839240651",
    appId: "1:1015839240651:web:048d05f1d612816ef9864e"
  };

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
