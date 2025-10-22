import { Ionicons } from "@expo/vector-icons";
import { signOut, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (auth.currentUser?.displayName) {
      setUsername(auth.currentUser.displayName);
    }
  }, []);

  const handleUpdateUsername = async () => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: username });
      Alert.alert("Succès 🎉", "Nom Utilisateur mis à jour ✅", [{ text: "OK" }]);
      navigation.navigate("Accueil");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Succès 🎉", "Déconnexion réussie 👋", [{ text: "OK" }]);
      navigation.navigate("Auth"); // 👈 Make sure the route name matches exactly your Drawer/Stack
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="person-circle-outline"
        size={100}
        color="#1077a7"
        style={{ marginBottom: 20 }}
      />
      <Text style={styles.title}>Profile Utilisateur</Text>

      <Text style={styles.label}>Nom d'utilisateur</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Votre nom"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUsername}>
        <Text style={styles.saveText}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se Déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1077a7",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 40,
    marginBottom: 5,
    color: "#555",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#1077a7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },
});
