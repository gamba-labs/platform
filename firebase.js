import firebase from 'firebase/app';
import 'firebase/auth'; // Import the authentication module
import 'firebase/firestore'; // Import Firestore
// ... import other Firebase modules as needed

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrZw1nIwHHoglV-L1AcOrcXasDRrFg0A8",
  authDomain: "raceme-54047.firebaseapp.com",
  databaseURL: "https://raceme-54047-default-rtdb.firebaseio.com",
  projectId: "raceme-54047",
  storageBucket: "raceme-54047.appspot.com",
  messagingSenderId: "530870651607",
  appId: "1:530870651607:web:6806b1b42ea85d1d5a7e92",
  measurementId: "G-S7RNR562MT"
};

firebase.initializeApp(firebaseConfig);
