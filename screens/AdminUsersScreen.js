import { Ionicons } from "@expo/vector-icons"; // ensure you have expo vector icons installed
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedRole, setEditedRole] = useState("");
  const usersPerPage = 10;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetched);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment supprimer cet utilisateur ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "users", id));
        },
      },
    ]);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditedRole(user.role);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    await updateDoc(doc(db, "users", selectedUser.id), { role: editedRole });
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setSelectedUser(null);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const nextPage = () => {
    if (indexOfLastUser < users.length) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.number]}>{indexOfFirstUser + index + 1}</Text>
      <Text style={[styles.cell, styles.name]}>{item.name}</Text>
      <Text style={[styles.cell, styles.email]}>{item.email}</Text>
      <Text style={[styles.cell, styles.role]}>{item.role}</Text>
      <View style={[styles.cell, styles.actions]}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={22} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#dc2626" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des utilisateurs</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>N°</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Nom</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Email</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Rôle</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
      </View>

      <FlatList
        data={currentUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.disabled]}
          onPress={prevPage}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageText}>Précédent</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          Page {currentPage} / {Math.ceil(users.length / usersPerPage) || 1}
        </Text>

        <TouchableOpacity
          style={[
            styles.pageButton,
            indexOfLastUser >= users.length && styles.disabled,
          ]}
          onPress={nextPage}
          disabled={indexOfLastUser >= users.length}
        >
          <Text style={styles.pageText}>Suivant</Text>
        </TouchableOpacity>
      </View>

      {/* Modal d'édition */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier le rôle</Text>

            {selectedUser && (
              <>
                <Text style={styles.modalLabel}>
                  Nom : <Text style={styles.modalValue}>{selectedUser.name}</Text>
                </Text>
                <Text style={styles.modalLabel}>
                  Email : <Text style={styles.modalValue}>{selectedUser.email}</Text>
                </Text>

                <Text style={[styles.modalLabel, { marginTop: 10 }]}>Rôle :</Text>
                <Picker
                  selectedValue={editedRole}
                  onValueChange={(value) => setEditedRole(value)}
                  style={styles.rolePicker}
                >
                  <Picker.Item label="Utilisateur" value="user" />
                  <Picker.Item label="Administrateur" value="admin" />
                  <Picker.Item label="Créateur" value="creator" />
                </Picker>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveText}>Enregistrer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 50,
    borderRadius: 25,
    borderColor: "#ddd",
    elevation: 2,
    margin: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#1077a7ff",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderColor: "#CBD5E1",
    paddingVertical: 8,
    backgroundColor: "#1077a7ff",
    borderRadius: 12,
    marginBottom: 10,
  },
  headerCell: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    backgroundColor: "#f8fcffff",
    borderColor: "#ddd",
  },
  cell: {
    textAlign: "center",
  },
  number: { flex: 0.5 },
  name: { flex: 1.5, textAlign: "left", paddingLeft: 4 },
  email: { flex: 2, textAlign: "left" },
  role: { flex: 1.2, textTransform: "capitalize" },
  actions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  pageButton: {
    backgroundColor: "#1077a7ff",
    padding: 8,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  pageText: {
    color: "#fff",
    fontWeight: "600",
  },
  pageIndicator: {
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "600",
    color: "#374151",
    marginTop: 5,
  },
  modalValue: {
    fontWeight: "normal",
    color: "#111827",
  },
  rolePicker: {
    height: 50,
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1077a7ff",
    padding: 10,
    borderRadius: 8,
    marginRight: 6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#9ca3af",
    padding: 10,
    borderRadius: 8,
    marginLeft: 6,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
