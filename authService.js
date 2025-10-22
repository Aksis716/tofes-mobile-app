// src/authService.js
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Sign up
export async function signUp(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  await setDoc(doc(db, "users", user.uid), {
    email,
    displayName,
    role: "user",
    createdAt: new Date(),
  });

  return user;
}

// Sign in
export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Logout
export async function logout() {
  await signOut(auth);
}

// Listen to auth changes
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
