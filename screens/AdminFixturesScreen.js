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

/**
 * Admin screen to populate (dummy) fixtures and edit them.
 * - Populate dummy data (only when collection is empty)
 * - Live list of fixtures (onSnapshot)
 * - Edit / Add / Delete fixtures
 *
 * Note: Adjust the fields (date/time format) to match how you'll use them in the Match screen.
 */

const TEAM_NAMES = [
  "Avions", "CFA", "EMAA", "EMART",
  "MGX", "Helicos", "CRDA", "Drones",
  "EDA", "Chasse", "OSA", "ETAA"
]; // 12 teams for example. Use the names you want.

function makeDefaultPlayers(teamName) {
  // returns 12 players with positions 1..12; positions 1..8 on field
  return Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    return {
      id: `p${num}-${teamName.replace(/\s+/g, "")}`,
      name: `${teamName} Player ${num}`,
      position: num <= 8 ? num : num, // 1..8 correspond to pitch positions
      goals: [], // array of strings like "63'"
      yellow: 0, // or time string like "63'"
      red: 0,
      injury: 0,
    };
  });
}

function generateGroupFixtures(groupTeams, groupLetter, startDateISO) {
  // round-robin pairs for 4-team group (6 matches)
  // groupTeams array length = 4
  const [A, B, C, D] = groupTeams;
  const pairs = [
    [A, B],
    [C, D],
    [A, C],
    [B, D],
    [A, D],
    [B, C],
  ];
  // stagger dates from startDateISO (string) by +1 day each match for simplicity
  const base = new Date(startDateISO);
  return pairs.map((p, idx) => {
    const matchDate = new Date(base.getTime() + idx * 24 * 60 * 60 * 1000);
    return {
      phase: `Poule ${groupLetter}`,
      date: matchDate.toISOString(), // ISO string: parseable later
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
  // Only run if collection empty
  try {
    const q = query(collection(db, "fixtures"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log("Fixtures collection not empty — skip populating dummy data.");
      return { inserted: false, reason: "not_empty" };
    }

    // Partition TEAM_NAMES into 3 groups of 4
    const groups = [
      TEAM_NAMES.slice(0, 4),
      TEAM_NAMES.slice(4, 8),
      TEAM_NAMES.slice(8, 12),
    ];

    const allFixtures = [];

    // generate group fixtures with different start dates to avoid collisions
    const startDates = ["2025-10-20T15:00:00Z", "2025-10-21T15:00:00Z", "2025-10-22T15:00:00Z"];
    groups.forEach((g, idx) => {
      const gf = generateGroupFixtures(g, String.fromCharCode(65 + idx), startDates[idx]);
      allFixtures.push(...gf);
    });

    // Quarter finals — use placeholders and dates after group phase
    const qfBase = new Date("2025-10-30T17:00:00Z");
    for (let i = 0; i < 4; i++) {
      const d = new Date(qfBase.getTime() + i * 3 * 60 * 60 * 1000);
      allFixtures.push({
        phase: "Quarts de Finale",
        date: d.toISOString(),
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

    // Semis
    const semiBase = new Date("2025-11-02T18:00:00Z");
    for (let i = 0; i < 2; i++) {
      const d = new Date(semiBase.getTime() + i * 4 * 60 * 60 * 1000);
      allFixtures.push({
        phase: "Demi-Finales",
        date: d.toISOString(),
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

    // Final
    allFixtures.push({
      phase: "Finale",
      date: new Date("2025-11-06T20:00:00Z").toISOString(),
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

    // Insert all into Firestore
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

  // live listener
  useEffect(() => {
    const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // convert server timestamps or ISO strings to readable date if needed in UI (we keep as-is)
      setFixtures(list);
      setLoading(false);
    }, (err) => {
      console.error("fixtures onSnapshot error", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    // safe populate button: only insert when empty. Leave commented if you want manual trigger.
    // You might want to keep a button in the UI to call populateDummyFixturesOnce()
  }, []);

  const openAddModal = () => {
    setEditingFixture(null);
    setForm({
      phase: "",
      date: new Date().toISOString(), // default to now ISO
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
      date: fixture.date || new Date().toISOString(),
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

  const saveFixture = async () => {
    // basic validation
    if (!form.team1 || !form.team2 || !form.date || !form.phase) {
      Alert.alert("Error", "Phase, date, team1 and team2 are required");
      return;
    }

    try {
      if (editingFixture) {
        const ref = doc(db, "fixtures", editingFixture.id);
        await updateDoc(ref, {
          ...form,
          // keep existing players arrays if already present (do not overwrite unless you want to)
        });
        Alert.alert("Saved", "Fixture updated");
      } else {
        // create a new fixture with default players
        const newFixture = {
          ...form,
          score1: null,
          score2: null,
          players1: makeDefaultPlayers(form.team1 || "TeamA"),
          players2: makeDefaultPlayers(form.team2 || "TeamB"),
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "fixtures"), newFixture);
        Alert.alert("Created", "Fixture added to database");
      }
      setModalVisible(false);
    } catch (err) {
      console.error("saveFixture error:", err);
      Alert.alert("Error", "Could not save fixture: " + String(err));
    }
  };

  const deleteFixture = async (fixture) => {
    Alert.alert(
      "Confirm delete",
      `Delete fixture ${fixture.team1} vs ${fixture.team2}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "fixtures", fixture.id));
            } catch (err) {
              console.error("delete error", err);
              Alert.alert("Error", "Could not delete: " + String(err));
            }
          },
        },
      ]
    );
  };

  const populateHandler = async () => {
    setLoading(true);
    const res = await populateDummyFixturesOnce();
    setLoading(false);
    if (res.inserted) {
      Alert.alert("Done", `Inserted ${res.count} fixtures`);
    } else if (res.reason === "not_empty") {
      Alert.alert("Skipped", "Fixtures collection is not empty.");
    } else {
      Alert.alert("Error", "Could not populate: " + String(res.error || "unknown"));
    }
  };

  const addDefaultPlayersToFixture = async (fixtureId, which = 1) => {
    // convenience: add default players for team1 or team2 if missing
    try {
      const fRef = doc(db, "fixtures", fixtureId);
      const f = fixtures.find(fx => fx.id === fixtureId);
      if (!f) throw new Error("fixture not found locally");
      const update = {};
      if (which === 1) update.players1 = f.players1 && f.players1.length ? f.players1 : makeDefaultPlayers(f.team1 || "Team1");
      else update.players2 = f.players2 && f.players2.length ? f.players2 : makeDefaultPlayers(f.team2 || "Team2");
      await updateDoc(fRef, update);
      Alert.alert("Done", "Players added");
    } catch (err) {
      console.error("addDefaultPlayersToFixture", err);
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: "#fff" }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Admin - Fixtures</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.headerButton} onPress={populateHandler}>
            <Ionicons name="cloud-download-outline" size={18} color="#fff" />
            <Text style={styles.headerButtonText}>Populate dummy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerButton, { backgroundColor: "#28a745" }]} onPress={openAddModal}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.headerButtonText}>Add fixture</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator size="large" color="#1077a7" style={{ marginTop: 20 }} />}

      <FlatList
        data={fixtures}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.phase}>{item.phase} • {new Date(item.date).toLocaleString()}</Text>
              <Text style={styles.matchTitle}>{item.team1}  vs  {item.team2}</Text>
              <Text style={styles.small}>Ref: {item.arbitre || "—"}  •  {item.coach1 || "—"} / {item.coach2 || "—"}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => addDefaultPlayersToFixture(item.id, 1)} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>P1+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => addDefaultPlayersToFixture(item.id, 2)} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>P2+</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={18} color="#1077a7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteFixture(item)} style={styles.iconBtn}>
                <Ionicons name="trash" size={18} color="#d9534f" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            {editingFixture ? "Edit Fixture" : "Add Fixture"}
          </Text>

          {[
            { key: "phase", placeholder: "Phase (e.g. Poule A / Quarter-Final)" },
            { key: "date", placeholder: "Date (ISO string e.g. 2025-10-24T18:00:00Z)" },
            { key: "team1", placeholder: "Team 1 name" },
            { key: "team2", placeholder: "Team 2 name" },
            { key: "coach1", placeholder: "Coach 1" },
            { key: "coach2", placeholder: "Coach 2" },
            { key: "arbitre", placeholder: "Referee" },
            { key: "score1", placeholder: "score1 (leave empty for null)" },
            { key: "score2", placeholder: "score2 (leave empty for null)" },
          ].map((f) => (
            <TextInput
              key={f.key}
              placeholder={f.placeholder}
              value={String(form[f.key] ?? "")}
              onChangeText={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
              style={styles.input}
            />
          ))}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <TouchableOpacity style={[styles.saveBtn]} onPress={saveFixture}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>{editingFixture ? "Save changes" : "Create fixture"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#333" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1077a7" },
  headerButton: { backgroundColor: "#1077a7", padding: 8, borderRadius: 8, marginLeft: 8, flexDirection: "row", alignItems: "center" },
  headerButtonText: { color: "#fff", marginLeft: 6, fontWeight: "600" },

  rowCard: { backgroundColor: "#f8f9fa", padding: 12, borderRadius: 10, flexDirection: "row", alignItems: "center" },
  phase: { color: "#666", fontSize: 12 },
  matchTitle: { fontSize: 16, fontWeight: "700", marginTop: 4, color: "#222" },
  small: { fontSize: 12, color: "#666", marginTop: 4 },

  actions: { marginLeft: 10, alignItems: "center" },
  iconBtn: { padding: 6, marginVertical: 2, backgroundColor: "#fff", borderRadius: 6, borderWidth: 1, borderColor: "#eee", minWidth: 42, alignItems: "center" },
  iconBtnText: { color: "#1077a7", fontWeight: "700" },

  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
  saveBtn: { backgroundColor: "#1077a7", padding: 12, borderRadius: 8, flex: 1, alignItems: "center", marginRight: 8 },
  cancelBtn: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, flex: 0.8, alignItems: "center" },
});
