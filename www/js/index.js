//index.js
import { displayNotification } from './notifications.js';
import { auth } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "(link unavailable)";
import './incidents.js';

// DOM Elements
const signInButton = document.getElementById("signInButton");
const signUpButton = document.getElementById("signUpButton");
const signOutButton = document.getElementById("signOutButton");
const message = document.getElementById("message");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const showSignUpLink = document.getElementById("showSignUp");
const showLoginLink = document.getElementById("showLogin");
const authenticationSection = document.getElementById("authentication");
const mainContentSections = document.querySelectorAll("header, nav, section:not(#authentication)");
const homeSection = document.getElementById("home");

// Helper Functions
function toggleVisibility(element, show) {
  element.style.display = show ? "block" : "none";
}

function showAuthentication() {
  toggleVisibility(authenticationSection, true);
  mainContentSections.forEach(section => toggleVisibility(section, false));
}

function showMainContent() {
  toggleVisibility(authenticationSection, false);
  mainContentSections.forEach(section => toggleVisibility(section, true));
  showHomeOnly();
}

function showHomeOnly() {
  document.querySelectorAll('section').forEach(section => {
    if (section.id !== "home") {
      section.style.display = "none";
    }
  });
  homeSection.style.display = "block";
}

// Auth Functions
const userSignIn = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((result) => {
      const user = result.user;
      console.log(user);
      displayNotification('Success', 'You have signed in successfully!', 'success');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error ${errorCode}: ${errorMessage}`);
      alert(`Error: ${errorMessage}`);
      displayNotification('Error', `Sign in failed: ${errorMessage}`, 'error');
    });
};

const userSignUp = async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((result) => {
      const user = result.user;
      console.log(user);
      displayNotification('Success', 'You have signed up successfully!', 'success');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error ${errorCode}: ${errorMessage}`);
      alert(`Error: ${errorMessage}`);
      displayNotification('Error', `Sign up failed: ${errorMessage}`, 'error');
    });
};

const userSignOut = async () => {
  signOut(auth).then(() => {
    alert("You have signed out successfully!");
    showAuthentication();
  }).catch((error) => {
    console.error(`Sign out error: ${error.message}`);
  });
};

// Auth State Change Handler
onAuthStateChanged(auth, (user) => {
  if (user) {
    signOutButton.style.display = "block";
    message.style.display = "block";
    userName.innerHTML = user.displayName || "User";
    userEmail.innerHTML = user.email;
    showMainContent();
  } else {
    signOutButton.style.display = "none";
    message.style.display = "none";
    showAuthentication();
  }
});

// Event Listeners
signInButton.addEventListener('click', userSignIn);
signUpButton.addEventListener('click', userSignUp);
signOutButton.addEventListener('click', userSignOut);

document.addEventListener('DOMContentLoaded', () => {
  showAuthentication();
});

showSignUpLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.style.display = "none";
  loginForm.style.display = "block";
});

// Menu Handling
function handleMenuClick(event) {
  event.preventDefault();

  const targetId = event.currentTarget.getAttribute('href').substring(1);

  const menuItems = document.querySelectorAll('.sidebar-menu-item');
  menuItems.forEach(item => item.classList.remove('active'));

  const sections = document.querySelectorAll('section');
  sections.forEach(section => section.style.display = 'none');

  event.currentTarget.classList.add('active');

  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  const submenu = event.currentTarget.nextElementSibling;
  if (submenu && submenu.tagName === 'UL') {
    submenu.classList.toggle('show');
  }
}

document.querySelectorAll('.sidebar-menu-item').forEach(item => {
  item.addEventListener('click', handleMenuClick);
});

document.getElementById('menu-icon').addEventListener('click', function() {
  this.classList.toggle('click');
  toggleSidebar();
});

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('show');
}

// Geolocation
navigator.geolocation.getCurrentPosition((position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  document.getElementById('latitude').value = latitude;
  document.getElementById('longitude').value = longitude;
}, (error) => {
  console.error(`Geolocation error: ${error.message}`);
});

