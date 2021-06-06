//import firebase from 'firebase'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import Vue from "vue";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyCcuY-Axv7ec_uKF_Vztbd0hnPvC3Nc0bQ",
  authDomain: "test2-8d4e7.firebaseapp.com",
  databaseURL: "https://test2-8d4e7-default-rtdb.firebaseio.com",
  projectId: "test2-8d4e7",
  storageBucket: "test2-8d4e7.appspot.com",
  messagingSenderId: "439563148692",
  appId: "1:439563148692:web:ad402b64ebd4f01f03c381",
  measurementId: "G-LPQBJ1FGY7"
};

Vue.prototype.$firebase = firebase
firebase.initializeApp(firebaseConfig)
// Initialize Firebase
//export const db = firebase.initializeApp(firebaseConfig).firestore();
export const db = firebase.firestore()
