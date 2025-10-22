import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function AuthScreen({ navigation }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const db = getFirestore();

  useEffect(() => {
    // Reset all fields when entering the screen
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  }, [isSignup]);

  const handleAuth = async () => {
    if (!email || !password) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs !");
    }

    if (isSignup && password !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas !");
    }

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          role: "user",
        });

        Alert.alert("Succès 🎉", "Compte créé avec succès !");
        navigation.navigate("Accueil");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Succès 🎉", "Connexion réussie !");
        navigation.navigate("Accueil");
      }
    } catch (error) {
      Alert.alert("Erreur ❌", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Ionicons name="person-circle-outline" size={100} color="#1077a7ff" />
      </View>

      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
        {isSignup ? "Créer un compte" : "Se connecter"}
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 20 }}>
        Créez un compte pour interagir avec le tournoi !
      </Text>

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
      />
      <TextInput
        placeholder="Mot de passe"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isSignup && (
        <TextInput
          placeholder="Confirmer le mot de passe"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}

      <TouchableOpacity onPress={handleAuth} style={styles.button}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {isSignup ? "S'inscrire" : "Se connecter"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={{ textAlign: "center", color: "#1077a7ff", marginTop: 15 }}>
          {isSignup ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#1077a7ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
};
