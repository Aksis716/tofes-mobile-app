import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [players, setPlayers] = useState([]);

  const teamsRef = collection(db, "teams");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const snapshot = await getDocs(teamsRef);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTeams(data);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setPlayers(team.players || []);
    setIsEditing(true);
  };

  const handleSaveTeam = async () => {
    if (!selectedTeam.fullname || !selectedTeam.name) {
      Alert.alert("Error", "Team name and full name are required.");
      return;
    }

    try {
      const docRef = doc(db, "teams", selectedTeam.id);
      await updateDoc(docRef, {
        coach: selectedTeam.coach,
        fullname: selectedTeam.fullname,
        name: selectedTeam.name,
        players: players,
        trophies: selectedTeam.trophies,
      });
      Alert.alert("Success", "Team updated successfully!");
      setIsEditing(false);
      fetchTeams();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleAddTeam = async () => {
    try {
      await addDoc(teamsRef, {
        coach: "",
        fullname: "",
        name: "",
        players: [],
        trophies: "",
      });
      fetchTeams();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDeleteTeam = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this team?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteDoc(doc(db, "teams", id));
          fetchTeams();
        },
        style: "destructive",
      },
    ]);
  };

  const handleSavePlayers = () => {
    setSelectedTeam({ ...selectedTeam, players });
    setIsPlayerModalVisible(false);
  };

  const handleAddPlayer = () => {
    setPlayers([
      ...players,
      { id: Date.now().toString(), name: "", number: "", position: "", goals: 0 },
    ]);
  };

  const handleDeletePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const renderTeam = ({ item }) => (
    <View style={styles.teamRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.subText}>Coach: {item.coach || "N/A"}</Text>
        <Text style={styles.subText}>Trophées: {item.trophies || "0"}</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEditTeam(item)}>
        <Text style={styles.btnText}>Modifier</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTeam(item.id)}>
        <Text style={styles.btnText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeam}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddTeam}>
            <Text style={styles.btnText}>+ Ajouter Equipe</Text>
          </TouchableOpacity>
        }
      />

      {/* Edit Team Modal */}
      <Modal visible={isEditing} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modfier Equipe</Text>

          <Text style={styles.subTitle}>   </Text>
          <Text style={styles.subTitle}>Nom Complet</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={selectedTeam?.fullname}
            onChangeText={(text) => setSelectedTeam({ ...selectedTeam, fullname: text })}
          />

          <Text style={styles.subTitle}>   </Text>
          <Text style={styles.subTitle}>Nom Abrégé</Text>
          <TextInput
            style={styles.input}
            placeholder="Short Name"
            value={selectedTeam?.name}
            onChangeText={(text) => setSelectedTeam({ ...selectedTeam, name: text })}
          />

          <Text style={styles.subTitle}>   </Text>
          <Text style={styles.subTitle}>Coach</Text>
          <TextInput
            style={styles.input}
            placeholder="Coach"
            value={selectedTeam?.coach}
            onChangeText={(text) => setSelectedTeam({ ...selectedTeam, coach: text })}
          />

          <Text style={styles.subTitle}>   </Text>
          <Text style={styles.subTitle}>Nombre de Tournois remportés</Text>
          <TextInput
            style={styles.input}
            placeholder="Trophies"
            value={selectedTeam?.trophies}
            onChangeText={(text) => setSelectedTeam({ ...selectedTeam, trophies: text })}
          />

          <TouchableOpacity
            style={styles.editPlayersButton}
            onPress={() => setIsPlayerModalVisible(true)}
          >
            <Text style={styles.btnText}>Modifier Joueurs</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 20 }}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTeam}>
              <Text style={styles.btnText}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.btnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* Edit Players Modal */}
      <Modal visible={isPlayerModalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier Joueurs</Text>

          {players.map((player, index) => (
            <View key={player.id} style={styles.playerBox}>
              <Text style={styles.subTitle}>Joueur {index + 1}</Text>

              <Text style={styles.subTitle}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={player.name}
                onChangeText={(text) =>
                  setPlayers(players.map((p) => (p.id === player.id ? { ...p, name: text } : p)))
                }
              />

              <Text style={styles.subTitle}>Numéro</Text>
              <TextInput
                style={styles.input}
                placeholder="Number"
                value={player.number}
                onChangeText={(text) =>
                  setPlayers(players.map((p) => (p.id === player.id ? { ...p, number: text } : p)))
                }
              />

              <Text style={styles.subTitle}>Position</Text>
              <TextInput
                style={styles.input}
                placeholder="Position"
                value={player.position}
                onChangeText={(text) =>
                  setPlayers(players.map((p) => (p.id === player.id ? { ...p, position: text } : p)))
                }
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePlayer(player.id)}
              >
                <Text style={styles.btnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
            <Text style={styles.btnText}>+ Ajouter Joueur</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSavePlayers}>
            <Text style={styles.btnText}>Enregistrer Joueurs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButtonModal}
            onPress={() => setIsPlayerModalVisible(false)}
          >
            <Text style={styles.btnText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10, marginBottom: 25 },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 18,
    marginVertical: 5,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  teamName: { fontSize: 16, fontWeight: "bold" },
  subText: { fontSize: 13, color: "#666" },
  btnText: { color: "#fff", fontWeight: "bold" },
  editButton: {
    backgroundColor: "#1077a7",
    padding: 8,
    borderRadius: 18,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#c7413aff",
    padding: 8,
    borderRadius: 18,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#249e38ff",
    padding: 12,
    marginVertical: 10,
    borderRadius: 18,
    alignItems: "center",
  },
  modalContent: { padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#1077a7",
    padding: 12,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 5,
  },
  cancelButtonModal: {
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 5,
    marginBottom: 40,
  },
  editPlayersButton: {
    backgroundColor: "#249e38ff",
    padding: 10,
    marginBottom: 25,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 10,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  playerBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  subTitle: { fontWeight: "bold", marginBottom: 5 },
});
