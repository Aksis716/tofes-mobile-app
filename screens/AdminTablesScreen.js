import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
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

export default function AdminTablesScreen() {
  const [poules, setPoules] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [assists, setAssists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [collectionKey, setCollectionKey] = useState("");

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ player: "", team: "", value: "" });
  const [addType, setAddType] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const poulesSnap = await getDocs(collection(db, "poules"));
      const scorersSnap = await getDocs(collection(db, "scorers"));
      const assistsSnap = await getDocs(collection(db, "assists"));

      const poulesList = poulesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const normalizedPoules = poulesList.map((p) => {
        const teams = Array.isArray(p.teams) ? [...p.teams] : [];
        while (teams.length < 4) {
          teams.push({
            team: `Team ${teams.length + 1}`,
            pts: 0,
            mp: 0,
            w: 0,
            d: 0,
            l: 0,
            gf: 0,
            ga: 0,
            gd: 0,
          });
        }
        return { ...p, teams };
      });

      setPoules(normalizedPoules);
      setScorers(scorersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAssists(assistsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading data:", err);
      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (item, key) => {
    const clone = JSON.parse(JSON.stringify(item));
    setSelectedItem(clone);
    setCollectionKey(key);
    setModalVisible(true);
  };

  const saveChanges = async () => {
    if (!selectedItem || !collectionKey) return;
    try {
      setLoading(true);
      const ref = doc(db, collectionKey, selectedItem.id);

      if (collectionKey === "poules") {
        const teams = selectedItem.teams.map((t) => ({
          ...t,
          pts: Number(t.pts || 0),
          mp: Number(t.mp || 0),
          w: Number(t.w || 0),
          d: Number(t.d || 0),
          l: Number(t.l || 0),
          gf: Number(t.gf || 0),
          ga: Number(t.ga || 0),
          gd: Number(t.gf || 0) - Number(t.ga || 0),
        }));
        await updateDoc(ref, { ...selectedItem, teams });
      } else if (collectionKey === "scorers") {
        await updateDoc(ref, {
          player: selectedItem.player,
          team: selectedItem.team,
          goals: Number(selectedItem.goals || 0),
        });
      } else if (collectionKey === "assists") {
        await updateDoc(ref, {
          player: selectedItem.player,
          team: selectedItem.team,
          assists: Number(selectedItem.assists || 0),
        });
      }

      Alert.alert("✅ Succès", "Les données ont été enregistrées !");
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error("Error saving:", err);
      Alert.alert("Erreur", "Impossible d’enregistrer les modifications.");
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (id, type) => {
    Alert.alert(
      "Supprimer le joueur",
      "Êtes-vous sûr de vouloir supprimer ce joueur ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, type, id));
              fetchData();
            } catch (err) {
              console.error("Error deleting:", err);
              Alert.alert("Erreur", "Impossible de supprimer ce joueur.");
            }
          },
        },
      ]
    );
  };

  const openAddModal = (type) => {
    setAddType(type);
    setNewPlayer({ player: "", team: "", value: "" });
    setAddModalVisible(true);
  };

  const addPlayer = async () => {
    if (!newPlayer.player || !newPlayer.team || !newPlayer.value) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      await addDoc(collection(db, addType), {
        player: newPlayer.player,
        team: newPlayer.team,
        [addType === "scorers" ? "goals" : "assists"]: Number(newPlayer.value),
      });
      setAddModalVisible(false);
      fetchData();
    } catch (err) {
      console.error("Error adding player:", err);
      Alert.alert("Erreur", "Impossible d’ajouter le joueur.");
    }
  };

  const renderPoulesEditor = () => {
    if (!selectedItem) return null;

    return (
      <>
        <Text style={styles.inputLabel}>Nom du groupe</Text>
        <TextInput
          style={styles.input}
          value={selectedItem.group}
          onChangeText={(v) => setSelectedItem((s) => ({ ...s, group: v }))}
        />

        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Équipes</Text>
        {selectedItem.teams.map((team, index) => (
          <View key={index} style={styles.teamBox}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>
              Équipe {index + 1}
            </Text>
            <TextInput
              style={styles.input}
              value={team.team}
              onChangeText={(v) => {
                const updated = [...selectedItem.teams];
                updated[index].team = v;
                setSelectedItem((s) => ({ ...s, teams: updated }));
              }}
              placeholder="Nom de l’équipe"
            />
            <View style={styles.statsRow}>
              {["pts", "mp", "w", "d", "l", "gf", "ga"].map((field) => (
                <View key={field} style={{ width: "30%", marginBottom: 6 }}>
                  <Text style={styles.smallLabel}>{field.toUpperCase()}</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={String(team[field] ?? 0)}
                    onChangeText={(v) => {
                      const updated = [...selectedItem.teams];
                      updated[index][field] = Number(v) || 0;
                      setSelectedItem((s) => ({ ...s, teams: updated }));
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </>
    );
  };

  const renderScorerEditor = () => (
    <>
      <Text style={styles.inputLabel}>Joueur</Text>
      <TextInput
        style={styles.input}
        value={selectedItem.player}
        onChangeText={(v) => setSelectedItem((s) => ({ ...s, player: v }))}
      />
      <Text style={styles.inputLabel}>Équipe</Text>
      <TextInput
        style={styles.input}
        value={selectedItem.team}
        onChangeText={(v) => setSelectedItem((s) => ({ ...s, team: v }))}
      />
      <Text style={styles.inputLabel}>Buts</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(selectedItem.goals ?? 0)}
        onChangeText={(v) =>
          setSelectedItem((s) => ({ ...s, goals: Number(v) || 0 }))
        }
      />
    </>
  );

  const renderAssistEditor = () => (
    <>
      <Text style={styles.inputLabel}>Joueur</Text>
      <TextInput
        style={styles.input}
        value={selectedItem.player}
        onChangeText={(v) => setSelectedItem((s) => ({ ...s, player: v }))}
      />
      <Text style={styles.inputLabel}>Équipe</Text>
      <TextInput
        style={styles.input}
        value={selectedItem.team}
        onChangeText={(v) => setSelectedItem((s) => ({ ...s, team: v }))}
      />
      <Text style={styles.inputLabel}>Passes décisives</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(selectedItem.assists ?? 0)}
        onChangeText={(v) =>
          setSelectedItem((s) => ({ ...s, assists: Number(v) || 0 }))
        }
      />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginBottom: 40 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Poules</Text>
            {poules.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => openEditModal(item, "poules")}
              >
                <Text style={styles.cardTitle}>{item.group}</Text>
                <Text>{item.teams.length} équipes</Text>
              </TouchableOpacity>
            ))}

            {/* ---- Buteurs ---- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.title}>Buteurs</Text>
              <TouchableOpacity onPress={() => openAddModal("scorers")}>
                <Ionicons name="add-circle-outline" size={26} color="#1077a7" />
              </TouchableOpacity>
            </View>

            {scorers.map((item) => (
              <View key={item.id} style={styles.cardRow}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openEditModal(item, "scorers")}
                >
                  <Text style={styles.cardTitle}>
                    {item.player} - {item.goals} buts
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deletePlayer(item.id, "scorers")}
                >
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            ))}

            {/* ---- Passeurs ---- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.title}>Passeurs</Text>
              <TouchableOpacity onPress={() => openAddModal("assists")}>
                <Ionicons name="add-circle-outline" size={26} color="#1077a7" />
              </TouchableOpacity>
            </View>

            {assists.map((item) => (
              <View key={item.id} style={styles.cardRow}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openEditModal(item, "assists")}
                >
                  <Text style={styles.cardTitle}>
                    {item.player} - {item.assists} passes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deletePlayer(item.id, "assists")}
                >
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        }
      />

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                Modifier — {collectionKey.toUpperCase()}
              </Text>

              {collectionKey === "poules" && renderPoulesEditor()}
              {collectionKey === "scorers" && renderScorerEditor()}
              {collectionKey === "assists" && renderAssistEditor()}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#1077a7" }]}
                  onPress={saveChanges}
                >
                  <Text style={{ color: "#fff" }}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Player Modal */}
      <Modal visible={addModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ajouter un joueur</Text>

            <TextInput
              placeholder="Nom du joueur"
              style={styles.input}
              value={newPlayer.player}
              onChangeText={(v) =>
                setNewPlayer((s) => ({ ...s, player: v }))
              }
            />
            <TextInput
              placeholder="Équipe"
              style={styles.input}
              value={newPlayer.team}
              onChangeText={(v) => setNewPlayer((s) => ({ ...s, team: v }))}
            />
            <TextInput
              placeholder={
                addType === "scorers"
                  ? "Nombre de buts"
                  : "Nombre de passes décisives"
              }
              keyboardType="numeric"
              style={styles.input}
              value={newPlayer.value}
              onChangeText={(v) => setNewPlayer((s) => ({ ...s, value: v }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#1077a7" }]}
                onPress={addPlayer}
              >
                <Text style={{ color: "#fff" }}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1077a7",
    textAlign: "center",
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#f8fcffff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 18,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 18,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  cardTitle: { fontWeight: "bold", fontSize: 14 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  inputLabel: { fontWeight: "600", marginBottom: 4 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  teamBox: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  smallLabel: { fontSize: 12, color: "#666", marginBottom: 2 },
  smallInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
  },
});
