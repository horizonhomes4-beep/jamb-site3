/* MathCloud Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyCChnGLdRdT0soI6o7p-0EJbpoicUEGpd0",
  authDomain: "year-2-6d497.firebaseapp.com",
  databaseURL: "https://year-2-6d497-default-rtdb.firebaseio.com",
  projectId: "year-2-6d497",
  storageBucket: "year-2-6d497.firebasestorage.app",
  messagingSenderId: "70719590431",
  appId: "1:70719590431:web:4c0c47626c854ea4e1052a"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
// Keep Firebase Authentication across pages so Google/email sessions survive navigation.
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
