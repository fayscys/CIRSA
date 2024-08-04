// firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkuIXItg_fY1eK6xhCG9PFA8Lno0PQai8",
    authDomain: "cira-fe476.firebaseapp.com",
    projectId: "cira-fe476",
    storageBucket: "cira-fe476.appspot.com",
    messagingSenderId: "451371465808",
    appId: "1:451371465808:web:b44553ae3cad53080d2555",
    measurementId: "G-6PXMV1X9QZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);




