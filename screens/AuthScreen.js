import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";

export default function AuthScreen({ navigation }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    // Reset all fields when switching between signup/login
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  }, [isSignup]);

  const handleAuth = async () => {
    if (!email || !password || (isSignup && !name)) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs !");
    }

    if (isSignup && password !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas !");
    }

    try {
      if (isSignup) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Save user data
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          role: "user",
        });

        // Send verification email
        await sendEmailVerification(user);
        Alert.alert(
          "Vérification requise",
          "Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail avant de vous connecter."
        );

        // Sign out after signup to enforce verification
        auth.signOut();
        navigation.navigate("Authentification");
      } else {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          await auth.signOut();
          return Alert.alert(
            "Email non vérifié ❌",
            "Veuillez vérifier votre adresse email avant de vous connecter."
          );
        }

        Alert.alert("Succès 🎉", "Connexion réussie !");
        navigation.navigate("Accueil");
      }
    } catch (error) {
      Alert.alert("Erreur ❌", error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      return Alert.alert(
        "Email requis",
        "Veuillez entrer votre adresse email pour réinitialiser votre mot de passe."
      );
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email envoyé 📧",
        "Un lien de réinitialisation du mot de passe a été envoyé à votre adresse email."
      );
    } catch (error) {
      Alert.alert("Erreur ❌", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={100} color="#1077a7" />
        <Text style={styles.title}>
          {isSignup ? "Créer un compte" : "Se connecter"}
        </Text>
        <Text style={styles.subtitle}>
          {isSignup
            ? "Créez un compte pour interagir avec le tournoi !"
            : "Connectez-vous pour accéder à votre compte."}
        </Text>
      </View>

      {isSignup && (
        <TextInput
          placeholder="Nom complet"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password field with show/hide icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mot de passe"
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#1077a7" />
        </TouchableOpacity>
      </View>

      {isSignup && (
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirmer le mot de passe"
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.iconButton}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={22}
              color="#1077a7"
            />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={handleAuth} style={styles.button}>
        <Text style={styles.buttonText}>
          {isSignup ? "S'inscrire" : "Se connecter"}
        </Text>
      </TouchableOpacity>

      {/* Forgot password (only for login mode) */}
      {!isSignup && (
        <TouchableOpacity onPress={handlePasswordReset}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.switchText}>
          {isSignup
            ? "Déjà un compte ? Se connecter"
            : "Pas de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1077a7",
    marginTop: 10,
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  iconButton: {
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#1077a7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgotPasswordText: {
    textAlign: "center",
    color: "#1077a7",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  switchText: {
    textAlign: "center",
    color: "#1077a7",
    marginTop: 15,
  },
});
