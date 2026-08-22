/* MathCloud Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyDZVsrsFsfJpyBQwWnl5pjHH-WQH-PuzDw",
  authDomain: "year-1-345c6.firebaseapp.com",
  databaseURL: "https://year-1-345c6-default-rtdb.firebaseio.com",
  projectId: "year-1-345c6",
  storageBucket: "year-1-345c6.firebasestorage.app",
  messagingSenderId: "323198543021",
  appId: "1:323198543021:web:c4f86cd8238ca7b51cd224"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
// Keep Firebase Authentication across pages so Google/email sessions survive navigation.
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
