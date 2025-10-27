import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({
              name: user.displayName || "Non défini",
              email: user.email,
              role: "user",
            });
          }
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger le profil : " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const translateRole = (role) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "creator":
        return "Créateur";
      default:
        return "Utilisateur";
    }
  };

  const handleUpdateName = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateProfile(user, { displayName: newName });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: newName });

      setUserData((prev) => ({ ...prev, name: newName }));
      setEditModalVisible(false);
      Alert.alert("Succès 🎉", "Nom mis à jour avec succès ✅");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le nom : " + error.message);
    }
  };

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      setOldPassword("");
      setNewPassword("");
      setPasswordModalVisible(false);
      Alert.alert("Succès 🎉", "Mot de passe mis à jour avec succès ✅");
    } catch (error) {
      Alert.alert("Erreur", "Échec de la mise à jour du mot de passe : " + error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, déconnecter",
          onPress: async () => {
            try {
              await signOut(auth);
              setUserData(null);
              navigation.reset({
                index: 0,
                routes: [{ name: "Authentification" }], // ✅ ensures form reset
              });
            } catch (error) {
              Alert.alert("Erreur", error.message);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="person-circle-outline"
        size={100}
        color="#1077a7"
        style={{ marginBottom: 10 }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Profil Utilisateur</Text>
        <TouchableOpacity
          onPress={() => {
            setNewName(userData?.name || "");
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={24} color="#1077a7" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Nom :</Text>
        <Text style={styles.value}>{userData?.name}</Text>

        <Text style={styles.label}>Email :</Text>
        <Text style={styles.value}>{userData?.email}</Text>

        <Text style={styles.label}>Rôle :</Text>
        <Text style={styles.value}>{translateRole(userData?.role)}</Text>
      </View>

      <TouchableOpacity
        style={styles.passwordButton}
        onPress={() => setPasswordModalVisible(true)}
      >
        <Ionicons name="key-outline" size={20} color="#fff" />
        <Text style={styles.passwordText}>Changer le mot de passe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se Déconnecter</Text>
      </TouchableOpacity>

      {/* Edit Name Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le nom</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nouveau nom"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateName}
              >
                <Text style={styles.saveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>

            <TextInput
              style={styles.input}
              placeholder="Ancien mot de passe"
              secureTextEntry={!showPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nouveau mot de passe"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#1077a7"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1077a7",
  },
  infoBox: {
    width: "85%",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  passwordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1077a7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  passwordText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1077a7",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    position: "absolute",
    right: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  cancelText: {
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#1077a7",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  saveText: {
    color: "#fff",
  },
});
