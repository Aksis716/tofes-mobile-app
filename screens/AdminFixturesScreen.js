import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
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
  View,
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
      name: `${teamName} Player ${num}`,
      position: num,
      goals: [],
      yellow: 0,
      red: 0,
      injury: 0,
    };
  });
}

function generateGroupFixtures(groupTeams, groupLetter, startDateISO) {
  const [A, B, C, D] = groupTeams;
  const pairs = [
    [A, B],
    [C, D],
    [A, C],
    [B, D],
    [A, D],
    [B, C],
  ];

  const base = new Date(startDateISO);
  return pairs.map((p, idx) => {
    const matchDate = new Date(base.getTime() + idx * 24 * 60 * 60 * 1000);
    return {
      phase: `Poule ${groupLetter}`,
      date: Timestamp.fromDate(matchDate),
      team1: p[0],
      team2: p[1],
      coach1: `${p[0]} Coach`,
      coach2: `${p[1]} Coach`,
      arbitre: `Referee ${idx + 1}`,
      score1: null,
      score2: null,
      players1: makeDefaultPlayers(p[0]),
      players2: makeDefaultPlayers(p[1]),
      createdAt: serverTimestamp(),
    };
  });
}

async function populateDummyFixturesOnce() {
  try {
    const q = query(collection(db, "fixtures"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log("Fixtures collection not empty — skip populating dummy data.");
      return { inserted: false, reason: "not_empty" };
    }

    const groups = [
      TEAM_NAMES.slice(0, 4),
      TEAM_NAMES.slice(4, 8),
      TEAM_NAMES.slice(8, 12),
    ];

    const allFixtures = [];
    const startDates = ["2025-10-20T15:00:00Z", "2025-10-21T15:00:00Z", "2025-10-22T15:00:00Z"];
    groups.forEach((g, idx) => {
      const gf = generateGroupFixtures(g, String.fromCharCode(65 + idx), startDates[idx]);
      allFixtures.push(...gf);
    });

    const qfBase = new Date("2025-10-30T17:00:00Z");
    for (let i = 0; i < 4; i++) {
      const d = new Date(qfBase.getTime() + i * 3 * 60 * 60 * 1000);
      allFixtures.push({
        phase: "Quarts de Finale",
        date: Timestamp.fromDate(d),
        team1: `QF${i + 1} Team 1`,
        team2: `QF${i + 1} Team 2`,
        coach1: `Coach Q${i + 1}A`,
        coach2: `Coach Q${i + 1}B`,
        arbitre: `Referee Q${i + 1}`,
        score1: null,
        score2: null,
        players1: makeDefaultPlayers(`QF${i + 1}A`),
        players2: makeDefaultPlayers(`QF${i + 1}B`),
        createdAt: serverTimestamp(),
      });
    }

    const semiBase = new Date("2025-11-02T18:00:00Z");
    for (let i = 0; i < 2; i++) {
      const d = new Date(semiBase.getTime() + i * 4 * 60 * 60 * 1000);
      allFixtures.push({
        phase: "Demi-Finales",
        date: Timestamp.fromDate(d),
        team1: `Winner Q${i * 2 + 1}`,
        team2: `Winner Q${i * 2 + 2}`,
        coach1: `Coach S${i + 1}A`,
        coach2: `Coach S${i + 1}B`,
        arbitre: `Referee S${i + 1}`,
        score1: null,
        score2: null,
        players1: makeDefaultPlayers(`S${i + 1}A`),
        players2: makeDefaultPlayers(`S${i + 1}B`),
        createdAt: serverTimestamp(),
      });
    }

    allFixtures.push({
      phase: "Finale",
      date: Timestamp.fromDate(new Date("2025-11-06T20:00:00Z")),
      team1: "Winner Semi 1",
      team2: "Winner Semi 2",
      coach1: "Final Coach 1",
      coach2: "Final Coach 2",
      arbitre: "Referee Final",
      score1: null,
      score2: null,
      players1: makeDefaultPlayers("FinalA"),
      players2: makeDefaultPlayers("FinalB"),
      createdAt: serverTimestamp(),
    });

    for (const f of allFixtures) {
      await addDoc(collection(db, "fixtures"), f);
    }

    console.log("✅ Dummy fixtures inserted:", allFixtures.length);
    return { inserted: true, count: allFixtures.length };
  } catch (err) {
    console.error("Error populating dummy fixtures:", err);
    return { inserted: false, error: err };
  }
}

export default function AdminFixturesScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [editingPlayers, setEditingPlayers] = useState(null);
  const [form, setForm] = useState({
    phase: "",
    date: "",
    team1: "",
    team2: "",
    coach1: "",
    coach2: "",
    arbitre: "",
    score1: "",
    score2: "",
  });

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

  const openAddModal = () => {
    setEditingFixture(null);
    setForm({
      phase: "",
      date: new Date().toISOString(),
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
    setEditingFixture(fixture);
    setForm({
      phase: fixture.phase || "",
      date: fixture.date?.toISOString?.() || new Date().toISOString(),
      team1: fixture.team1 || "",
      team2: fixture.team2 || "",
      coach1: fixture.coach1 || "",
      coach2: fixture.coach2 || "",
      arbitre: fixture.arbitre || "",
      score1: fixture.score1 ?? "",
      score2: fixture.score2 ?? "",
    });
    setModalVisible(true);
  };

  const openPlayersModal = (fixture) => setEditingPlayers(fixture);

  const saveFixture = async () => {
    if (!form.team1 || !form.team2 || !form.date || !form.phase) {
      Alert.alert("Error", "Phase, date, team1 and team2 are required");
      return;
    }

    try {
      const payload = {
        ...form,
        date: Timestamp.fromDate(new Date(form.date)),
      };

      if (editingFixture) {
        await updateDoc(doc(db, "fixtures", editingFixture.id), payload);
        Alert.alert("Saved", "Fixture updated");
      } else {
        await addDoc(collection(db, "fixtures"), {
          ...payload,
          players1: makeDefaultPlayers(form.team1),
          players2: makeDefaultPlayers(form.team2),
          createdAt: serverTimestamp(),
        });
        Alert.alert("Created", "Fixture added");
      }
      setModalVisible(false);
    } catch (err) {
      console.error("saveFixture error:", err);
      Alert.alert("Error", "Could not save fixture: " + String(err));
    }
  };

  const savePlayers = async (fixtureId, updatedPlayers1, updatedPlayers2) => {
    try {
      await updateDoc(doc(db, "fixtures", fixtureId), {
        players1: updatedPlayers1,
        players2: updatedPlayers2,
      });
      Alert.alert("Saved", "Players updated");
      setEditingPlayers(null);
    } catch (err) {
      Alert.alert("Error", "Could not save players: " + err);
    }
  };

  const deleteFixture = async (fixture) => {
    Alert.alert("Confirm delete", `Delete fixture ${fixture.team1} vs ${fixture.team2}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "fixtures", fixture.id));
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: "#fff" }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Admin - Fixtures</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={populateDummyFixturesOnce}
          >
            <Ionicons name="cloud-download-outline" size={18} color="#fff" />
            <Text style={styles.headerButtonText}>Populate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: "#28a745" }]}
            onPress={openAddModal}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.headerButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
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

      {/* Fixture modal (add/edit) */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.modalTitle}>
            {editingFixture ? "Edit Fixture" : "Add Fixture"}
          </Text>
          {Object.keys(form).map((key) => (
            <TextInput
              key={key}
              placeholder={key}
              value={String(form[key] ?? "")}
              onChangeText={(v) => setForm((s) => ({ ...s, [key]: v }))}
              style={styles.input}
            />
          ))}
          <TouchableOpacity style={styles.saveBtn} onPress={saveFixture}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {editingFixture ? "Save" : "Create"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Player editor modal */}
      <Modal visible={!!editingPlayers} animationType="slide">
        {editingPlayers && (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.modalTitle}>
              Edit Players - {editingPlayers.team1} & {editingPlayers.team2}
            </Text>

            {/* TEAM 1 */}
            <Text style={{ fontWeight: "bold" }}>
              Team 1 ({editingPlayers.team1})
            </Text>
            {editingPlayers.players1?.map((p, i) => (
              <View key={p.id} style={styles.playerBox}>
                <Text style={styles.playerLabel}>#{i + 1}</Text>
                <TextInput
                  placeholder="Name"
                  value={p.name}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].name = v;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Position"
                  value={String(p.position ?? "")}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].position = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Goals"
                  value={String(p.goals ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].goals = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Yellow Cards"
                  value={String(p.yellow ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].yellow = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Red Cards"
                  value={String(p.red ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].red = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Injury (0 or 1)"
                  value={String(p.injury ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players1];
                    updated[i].injury = parseInt(v) ? 1 : 0;
                    setEditingPlayers((s) => ({ ...s, players1: updated }));
                  }}
                  style={styles.input}
                />
              </View>
            ))}

            {/* TEAM 2 */}
            <Text style={{ fontWeight: "bold", marginTop: 20 }}>
              Team 2 ({editingPlayers.team2})
            </Text>
            {editingPlayers.players2?.map((p, i) => (
              <View key={p.id} style={styles.playerBox}>
                <Text style={styles.playerLabel}>#{i + 1}</Text>
                <TextInput
                  placeholder="Name"
                  value={p.name}
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].name = v;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Position"
                  value={String(p.position ?? "")}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].position = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Goals"
                  value={String(p.goals ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].goals = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Yellow Cards"
                  value={String(p.yellow ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].yellow = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Red Cards"
                  value={String(p.red ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].red = parseInt(v) || 0;
                    setEditingPlayers((s) => ({ ...s, players2: updated }));
                  }}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Injury (0 or 1)"
                  value={String(p.injury ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const updated = [...editingPlayers.players2];
                    updated[i].injury = parseInt(v) ? 1 : 0;
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
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Save Players
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditingPlayers(null)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1077a7" },
  headerButton: { backgroundColor: "#1077a7", padding: 8, borderRadius: 8, marginLeft: 8, flexDirection: "row", alignItems: "center" },
  headerButtonText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  rowCard: { backgroundColor: "#d2e1f0ff", padding: 12, borderRadius: 10, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  matchTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginTop: 20 },
  actions: { marginLeft: 10, alignItems: "center" },
  iconBtn: { padding: 6, marginVertical: 2, backgroundColor: "#fff", borderRadius: 6, borderWidth: 1, borderColor: "#eee", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
  saveBtn: { backgroundColor: "#1077a7", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  cancelBtn: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
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
});
