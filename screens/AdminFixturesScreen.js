import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../firebaseConfig";

const TEAM_NAMES = [
  "Avions", "CFA", "EMAA", "EMART",
  "MGX", "Helicos", "CRDA", "Drones",
  "EDA", "Chasse", "OSA", "ETAA"
];

function makeDefaultPlayers(teamName) {
  return Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    return {
      id: `p${num}-${teamName.replace(/\s+/g, "")}`,
      name: `${teamName} Joueur ${num}`,
      position: num,
      goals: [],
      yellow: 0,
      red: 0,
      injury: 0,
    };
  });
}

export default function AdminFixturesScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [editingPlayers, setEditingPlayers] = useState(null);
  const [form, setForm] = useState({
    phase: "",
    date: new Date(),
    team1: "",
    team2: "",
    coach1: "",
    coach2: "",
    arbitre: "",
    score1: "",
    score2: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load fixtures
  useEffect(() => {
    const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        };
      });
      setFixtures(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Open add/edit
  const openAddModal = () => {
    setEditingFixture(null);
    setForm({
      phase: "",
      date: new Date(),
      team1: "",
      team2: "",
      coach1: "",
      coach2: "",
      arbitre: "",
      score1: "",
      score2: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (fixture) => {
    // Format existing date to DD-MM-YYYY HH:mm
    const d = fixture.date instanceof Date ? fixture.date : new Date(fixture.date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;

    setEditingFixture(fixture);
    setForm({
      phase: fixture.phase || "",
      date: d,
      team1: fixture.team1 || "",
      team2: fixture.team2 || "",
      coach1: fixture.coach1 || "",
      coach2: fixture.coach2 || "",
      arbitre: fixture.arbitre || "",
      score1: fixture.score1 ?? "",
      score2: fixture.score2 ?? "",
      dateInput: formattedDate, // ✅ Pre-fill previous date in DD-MM-YYYY HH:mm
    });
    setModalVisible(true);
  };

  const openPlayersModal = (fixture) => setEditingPlayers(fixture);

  // Save fixture
  const saveFixture = async () => {
    if (!form.team1 || !form.team2 || !form.phase || !form.dateInput) {
      Alert.alert("Erreur", "Phase, équipes et date sont obligatoires");
      return;
    }

    // ✅ Parse DD-MM-YYYY HH:mm into Date
    const parts = form.dateInput.split(" ");
    if (parts.length !== 2) {
      Alert.alert("Erreur", "Format de date invalide. Utilisez DD-MM-YYYY HH:mm");
      return;
    }

    const [datePart, timePart] = parts;
    const [day, month, year] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const parsedDate = new Date(year, month - 1, day, hour, minute);

    if (isNaN(parsedDate.getTime())) {
      Alert.alert("Erreur", "Format de date invalide. Utilisez DD-MM-YYYY HH:mm");
      return;
    }

    try {
      const payload = {
        ...form,
        date: Timestamp.fromDate(parsedDate),
      };

      if (editingFixture) {
        await updateDoc(doc(db, "fixtures", editingFixture.id), payload);
        Alert.alert("Succès", "Match modifié");
      } else {
        await addDoc(collection(db, "fixtures"), {
          ...payload,
          players1: makeDefaultPlayers(form.team1),
          players2: makeDefaultPlayers(form.team2),
          createdAt: serverTimestamp(),
        });
        Alert.alert("Succès", "Match ajouté");
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d’enregistrer le match : " + String(err));
    }
  };



  // Save players
  const savePlayers = async (fixtureId, updatedPlayers1, updatedPlayers2) => {
    try {
      await updateDoc(doc(db, "fixtures", fixtureId), {
        players1: updatedPlayers1,
        players2: updatedPlayers2,
      });
      Alert.alert("Succès", "Joueurs mis à jour");
      setEditingPlayers(null);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d’enregistrer : " + err);
    }
  };

  // Delete fixture
  const deleteFixture = async (fixture) => {
    Alert.alert(
      "Confirmation",
      `Supprimer le match ${fixture.team1} vs ${fixture.team2} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "fixtures", fixture.id));
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: "#f5f5f5" }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Admin - Matchs</Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: "#28a745" }]}
          onPress={openAddModal}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.headerButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#1077a7" />}

      <FlatList
        data={fixtures}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.phase}>
                {item.phase} • {item.date.toLocaleString()}
              </Text>
              <Text style={styles.matchTitle}>
                {item.team1} vs {item.team2}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => openPlayersModal(item)}
                style={styles.iconBtn}
              >
                <Ionicons name="people" size={18} color="#1077a7" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                style={styles.iconBtn}
              >
                <Ionicons name="pencil" size={18} color="#1077a7" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteFixture(item)}
                style={styles.iconBtn}
              >
                <Ionicons name="trash" size={18} color="#d9534f" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Fixture modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.modalTitle}>
            {editingFixture ? "Modifier un match" : "Ajouter un match"}
          </Text>

          <Text style={styles.label}>Phase</Text>
          <TextInput
            value={form.phase}
            onChangeText={(v) => setForm({ ...form, phase: v })}
            style={styles.input}
          />

          <Text style={styles.label}>Date et heure (DD-MM-YYYY HH:mm)</Text>
          <TextInput
            value={form.dateInput}
            placeholder="2025-10-26 14:30"
            onChangeText={(v) => setForm({ ...form, dateInput: v })}
            style={styles.input}
          />

          <Text style={styles.label}>Équipe 1</Text>
          <TextInput
            value={form.team1}
            onChangeText={(v) => setForm({ ...form, team1: v })}
            style={styles.input}
          />
          <Text style={styles.label}>Équipe 2</Text>
          <TextInput
            value={form.team2}
            onChangeText={(v) => setForm({ ...form, team2: v })}
            style={styles.input}
          />
          <Text style={styles.label}>Entraîneur 1</Text>
          <TextInput
            value={form.coach1}
            onChangeText={(v) => setForm({ ...form, coach1: v })}
            style={styles.input}
          />
          <Text style={styles.label}>Entraîneur 2</Text>
          <TextInput
            value={form.coach2}
            onChangeText={(v) => setForm({ ...form, coach2: v })}
            style={styles.input}
          />
          <Text style={styles.label}>Arbitre</Text>
          <TextInput
            value={form.arbitre}
            onChangeText={(v) => setForm({ ...form, arbitre: v })}
            style={styles.input}
          />
          <Text style={styles.label}>Score équipe 1</Text>
          <TextInput
            keyboardType="numeric"
            value={String(form.score1)}
            onChangeText={(v) => setForm({ ...form, score1: v })}
            style={styles.input}
          />
          <Text style={styles.label}>Score équipe 2</Text>
          <TextInput
            keyboardType="numeric"
            value={String(form.score2)}
            onChangeText={(v) => setForm({ ...form, score2: v })}
            style={styles.input}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveFixture}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Players modal */}
      <Modal visible={!!editingPlayers} animationType="slide">
        {editingPlayers && (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.modalTitle}>
              Joueurs - {editingPlayers.team1} & {editingPlayers.team2}
            </Text>

            {/* Team 1 */}
            <Text style={[styles.teamTitle, { color: "#1077a7" }]}>
              {editingPlayers.team1}
            </Text>
            {editingPlayers.players1?.map((p, i) => (
              <View key={p.id} style={styles.playerBox}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  value={p.name}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].name = v;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <Text style={styles.label}>Position</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.position ?? "")}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].position = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />

                <Text style={styles.label}>Buts (séparés par des virgules)</Text>
                <TextInput
                  value={Array.isArray(p.goals) ? p.goals.join(", ") : String(p.goals || "")}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1]; // or players2 for team 2
                    updated[i].goals = v
                      ? v.split(",").map((x) => x.trim())
                      : [];
                    setEditingPlayers((s) => ({ ...s, players1: updated })); // or players2
                  }}
                  style={styles.input}
                />

                <Text style={styles.label}>Cartons jaunes</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.yellow ?? 0)}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].yellow = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <Text style={styles.label}>Cartons rouges</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.red ?? 0)}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].red = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <Text style={styles.label}>Blessure (nombre)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.injury ?? 0)}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].injury = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
              </View>
            ))}

            {/* Team 2 */}
            <Text style={[styles.teamTitle, { color: "#d9534f" }]}>
              {editingPlayers.team2}
            </Text>
            {editingPlayers.players2?.map((p, i) => (
              <View key={p.id} style={styles.playerBox}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  value={p.name}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].name = v;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />

                <Text style={styles.label}>Position</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.position ?? "")}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].position = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />

                <Text style={styles.label}>Buts (séparés par des virgules)</Text>
                <TextInput
                  value={Array.isArray(p.goals) ? p.goals.join(", ") : String(p.goals || "")}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2]; // or players2 for team 2
                    updated[i].goals = v
                      ? v.split(",").map((x) => x.trim())
                      : [];
                    setEditingPlayers((s) => ({ ...s, players2: updated })); // or players2
                  }}
                  style={styles.input}
                />

                <Text style={styles.label}>Cartons jaunes</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.yellow ?? 0)}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].yellow = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <Text style={styles.label}>Cartons rouges</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.red ?? 0)}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].red = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <Text style={styles.label}>Blessure (nombre)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(p.injury ?? 0)}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].injury = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() =>
                savePlayers(
                  editingPlayers.id,
                  editingPlayers.players1,
                  editingPlayers.players2
                )
              }
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditingPlayers(null)}
            >
              <Text>Annuler</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1077a7" },
  headerButton: {
    backgroundColor: "#1077a7",
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButtonText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  rowCard: {
    backgroundColor: "#ebf5fcff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  matchTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginTop: 20 },
  actions: { marginLeft: 10, alignItems: "center" },
  iconBtn: {
    padding: 6,
    marginVertical: 2,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#1077a7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  playerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fdfdfd",
  },
  playerLabel: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1077a7",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f7f7f7",
  },
});

