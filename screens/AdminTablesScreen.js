import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
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

  // fetch all three collections
  const fetchData = async () => {
    setLoading(true);
    try {
      const poulesSnap = await getDocs(collection(db, "poules"));
      const scorersSnap = await getDocs(collection(db, "scorers"));
      const assistsSnap = await getDocs(collection(db, "assists"));

      const poulesList = poulesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // ensure each poule has exactly 4 teams when displaying
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
      Alert.alert("Error", "Could not load data. See console.");
    } finally {
      setLoading(false);
    }
  };

  // create some dummy data
  const createDummyData = async () => {
    try {
      setLoading(true);

      const poulesData = [
        {
          id: "pouleA",
          group: "Poule A",
          teams: [
            { team: "Eagles", pts: 25, mp: 10, w: 8, d: 1, l: 1, gf: 20, ga: 8, gd: 12 },
            { team: "Lions", pts: 21, mp: 10, w: 7, d: 0, l: 3, gf: 18, ga: 12, gd: 6 },
            { team: "Wanderers", pts: 12, mp: 10, w: 3, d: 3, l: 4, gf: 10, ga: 13, gd: -3 },
            { team: "Rovers", pts: 8, mp: 10, w: 2, d: 2, l: 6, gf: 9, ga: 21, gd: -12 },
          ],
        },
        {
          id: "pouleB",
          group: "Poule B",
          teams: [
            { team: "Falcons", pts: 24, mp: 10, w: 7, d: 3, l: 0, gf: 19, ga: 7, gd: 12 },
            { team: "Panthers", pts: 19, mp: 10, w: 6, d: 1, l: 3, gf: 15, ga: 11, gd: 4 },
            { team: "Cobras", pts: 15, mp: 10, w: 4, d: 3, l: 3, gf: 12, ga: 11, gd: 1 },
            { team: "Hawks", pts: 8, mp: 10, w: 2, d: 2, l: 6, gf: 7, ga: 17, gd: -10 },
          ],
        },
        {
          id: "pouleC",
          group: "Poule C",
          teams: [
            { team: "Wolves", pts: 17, mp: 10, w: 5, d: 2, l: 3, gf: 14, ga: 13, gd: 1 },
            { team: "Tigers", pts: 13, mp: 10, w: 4, d: 1, l: 5, gf: 12, ga: 16, gd: -4 },
            { team: "Bulls", pts: 11, mp: 10, w: 3, d: 2, l: 5, gf: 10, ga: 14, gd: -4 },
            { team: "Stallions", pts: 9, mp: 10, w: 2, d: 3, l: 5, gf: 9, ga: 15, gd: -6 },
          ],
        },
      ];

      const scorersData = [
        { id: "s1", player: "John Doe", team: "Eagles", goals: 12 },
        { id: "s2", player: "Ali Karim", team: "Falcons", goals: 10 },
      ];

      const assistsData = [
        { id: "a1", player: "Mohamed Salah", team: "Lions", assists: 9 },
        { id: "a2", player: "Carlos Silva", team: "Falcons", assists: 7 },
      ];

      for (let p of poulesData) await setDoc(doc(db, "poules", p.id), p);
      for (let s of scorersData) await setDoc(doc(db, "scorers", s.id), s);
      for (let a of assistsData) await setDoc(doc(db, "assists", a.id), a);

      Alert.alert("✅ Done", "Dummy data added successfully!");
      await fetchData();
    } catch (err) {
      console.error("Error creating dummy data:", err);
      Alert.alert("Error", "Could not create dummy data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (item, key) => {
    // clone item to local state so editing doesn't mutate original directly
    const clone = JSON.parse(JSON.stringify(item));
    setSelectedItem(clone);
    setCollectionKey(key);
    setModalVisible(true);
  };

  const addNewItem = async (key) => {
    try {
      setLoading(true);
      if (key === "poules") {
        // create a new poule with 4 placeholder teams
        const newId = `poule_${Date.now()}`;
        const payload = {
          id: newId,
          group: `Poule ${String.fromCharCode(65 + poules.length)}`,
          teams: Array.from({ length: 4 }).map((_, i) => ({
            team: `Team ${i + 1}`,
            pts: 0,
            mp: 0,
            w: 0,
            d: 0,
            l: 0,
            gf: 0,
            ga: 0,
            gd: 0,
          })),
        };
        await setDoc(doc(db, "poules", newId), payload);
      } else if (key === "scorers") {
        const payload = { player: "New Player", team: "Team", goals: 0 };
        await addDoc(collection(db, "scorers"), payload);
      } else if (key === "assists") {
        const payload = { player: "New Player", team: "Team", assists: 0 };
        await addDoc(collection(db, "assists"), payload);
      }
      await fetchData();
    } catch (err) {
      console.error("Error adding item:", err);
      Alert.alert("Error", "Could not add item.");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId, key) => {
    Alert.alert("Confirm delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, key, itemId));
            await fetchData();
          } catch (err) {
            console.error("Error deleting:", err);
            Alert.alert("Error", "Could not delete item.");
          }
        },
      },
    ]);
  };

  // ensure poules.teams length = 4 when saving
  const ensureFourTeams = (teams) => {
    const t = Array.isArray(teams) ? [...teams] : [];
    while (t.length < 4) {
      t.push({
        team: `Team ${t.length + 1}`,
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
    // If more than 4, keep first 4
    return t.slice(0, 4);
  };

  const saveChanges = async () => {
    if (!selectedItem || !collectionKey) return;

    try {
      setLoading(true);
      const ref = doc(db, collectionKey, selectedItem.id);

      if (collectionKey === "poules") {
        // coerce numeric fields and ensure 4 teams
        const teams = ensureFourTeams(selectedItem.teams || []);
        const normalizedTeams = teams.map((tm) => ({
          team: String(tm.team ?? ""),
          pts: Number(tm.pts ?? 0),
          mp: Number(tm.mp ?? 0),
          w: Number(tm.w ?? 0),
          d: Number(tm.d ?? 0),
          l: Number(tm.l ?? 0),
          gf: Number(tm.gf ?? 0),
          ga: Number(tm.ga ?? 0),
          gd: Number(tm.gd ?? (Number(tm.gf ?? 0) - Number(tm.ga ?? 0))),
        }));
        const payload = {
          ...selectedItem,
          teams: normalizedTeams,
          group: selectedItem.group ?? selectedItem.id,
        };
        await updateDoc(ref, payload);
      } else if (collectionKey === "scorers") {
        const payload = {
          ...selectedItem,
          player: String(selectedItem.player ?? ""),
          team: String(selectedItem.team ?? ""),
          goals: Number(selectedItem.goals ?? 0),
        };
        await updateDoc(ref, payload);
      } else if (collectionKey === "assists") {
        const payload = {
          ...selectedItem,
          player: String(selectedItem.player ?? ""),
          team: String(selectedItem.team ?? ""),
          assists: Number(selectedItem.assists ?? 0),
        };
        await updateDoc(ref, payload);
      }

      Alert.alert("✅ Updated!", "Data saved successfully.");
      setModalVisible(false);
      await fetchData();
    } catch (error) {
      console.error("Error updating:", error);
      Alert.alert("❌ Error", "Failed to update data.");
    } finally {
      setLoading(false);
    }
  };

  const renderList = (title, data, key) => (
    <View style={styles.section}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: "#1077a7" }]} onPress={() => addNewItem(key)}>
            <Text style={{ color: "#fff" }}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openEditModal(item, key)}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={styles.cardTitle}>
                  {item.group || item.player || (item.teams ? item.id : item.team)}
                </Text>
                {item.teams && <Text style={styles.cardSubtitle}>{item.teams.length} équipes (editable)</Text>}
                {item.goals !== undefined && <Text style={styles.cardSubtitle}>{item.goals} buts</Text>}
                {item.assists !== undefined && <Text style={styles.cardSubtitle}>{item.assists} passes</Text>}
              </View>

              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={[styles.smallBtn, { marginRight: 8 }]} onPress={() => openEditModal(item, key)}>
                  <Text>Éditer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: "#f44336" }]} onPress={() => deleteItem(item.id, key)}>
                  <Text style={{ color: "#fff" }}>Suppr</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  /**********************
   * Modal rendering
   **********************/
  const renderPoulesEditor = () => {
    if (!selectedItem) return null;

    return (
      <>
        <Text style={styles.inputLabel}>ID du groupe</Text>
        <TextInput style={styles.input} value={selectedItem.id} editable={false} />

        <Text style={styles.inputLabel}>Nom du groupe</Text>
        <TextInput
          style={styles.input}
          value={selectedItem.group ?? ""}
          onChangeText={(v) => setSelectedItem((s) => ({ ...s, group: v }))}
        />

        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Équipes (exactement 4)</Text>

        {selectedItem.teams?.map((t, idx) => (
          <View key={idx} style={{ marginBottom: 8, borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 8 }}>
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>#{idx + 1}</Text>
            <Text style={styles.inputLabel}>Nom de l’équipe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l’équipe"
              value={String(t.team ?? "")}
              onChangeText={(v) => {
                const updated = [...selectedItem.teams];
                updated[idx].team = v;
                setSelectedItem((s) => ({ ...s, teams: updated }));
              }}
            />

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              <TextInput style={[styles.input, { width: "48%" }]} placeholder="Pts" />
              <TextInput style={[styles.input, { width: "48%" }]} placeholder="MJ" />
              <TextInput style={[styles.input, { width: "30%" }]} placeholder="G" />
              <TextInput style={[styles.input, { width: "30%" }]} placeholder="N" />
              <TextInput style={[styles.input, { width: "30%" }]} placeholder="P" />
              <TextInput style={[styles.input, { width: "48%" }]} placeholder="BP" />
              <TextInput style={[styles.input, { width: "48%" }]} placeholder="BC" />
              <TextInput style={[styles.input, { width: "48%", marginTop: 6 }]} placeholder="Diff" />
            </View>
          </View>
        ))}


        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: "#eee" }]}
            onPress={() => {
              // add empty team (but we will later enforce 4 teams max)
              const teams = [...(selectedItem.teams || [])];
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
              setSelectedItem((s) => ({ ...s, teams }));
            }}
          >
            <Text>Ajouter équipe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: "#f44336" }]}
            onPress={() => {
              // remove last if more than 1
              const teams = [...(selectedItem.teams || [])];
              if (teams.length > 1) {
                teams.pop();
                setSelectedItem((s) => ({ ...s, teams }));
              } else {
                Alert.alert("Info", "Il doit y avoir au moins une équipe.");
              }
            }}
          >
            <Text style={{ color: "#fff" }}>Supprimer équipe</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderScorerEditor = () => {
    if (!selectedItem) return null;
    return (
      <>

        <Text style={styles.inputLabel}>Joueur</Text>
        <TextInput style={styles.input} value={String(selectedItem.player ?? "")} onChangeText={(v) => setSelectedItem((s) => ({ ...s, player: v }))} />

        <Text style={styles.inputLabel}>Équipe</Text>
        <TextInput style={styles.input} value={String(selectedItem.team ?? "")} onChangeText={(v) => setSelectedItem((s) => ({ ...s, team: v }))} />

        <Text style={styles.inputLabel}>Buts</Text>
        <TextInput style={styles.input} value={String(selectedItem.goals ?? 0)} keyboardType="numeric" onChangeText={(v) => setSelectedItem((s) => ({ ...s, goals: Number(v || 0) }))} />

      </>
    );
  };

  const renderAssistEditor = () => {
    if (!selectedItem) return null;
    return (
      <>

        <Text style={styles.inputLabel}>Joueur</Text>
        <TextInput style={styles.input} value={String(selectedItem.player ?? "")} onChangeText={(v) => setSelectedItem((s) => ({ ...s, player: v }))} />

        <Text style={styles.inputLabel}>Équipe</Text>
        <TextInput style={styles.input} value={String(selectedItem.team ?? "")} onChangeText={(v) => setSelectedItem((s) => ({ ...s, team: v }))} />

        <Text style={styles.inputLabel}>Passes décisives</Text>
        <TextInput style={styles.input} value={String(selectedItem.assists ?? 0)} keyboardType="numeric" onChangeText={(v) => setSelectedItem((s) => ({ ...s, assists: Number(v || 0) }))} />

      </>
    );
  };

  const VirtualizedList = ({ children }) => {
    return (
      <FlatList
        data={[]}
        keyExtractor={() => "key"}
        renderItem={null}
        ListHeaderComponent={<>{children}</>}
      />
    );
  };

  return (
    <VirtualizedList>

      <TouchableOpacity
        style={styles.button}
        onPress={createDummyData}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Chargement..." : "Créer des données fictives"}
        </Text>
      </TouchableOpacity>

      {renderList("Poules", poules, "poules")}
      {renderList("Buteurs", scorers, "scorers")}
      {renderList("Passeurs", assists, "assists")}

      {/* Modal for editing */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Modifier — {collectionKey}</Text>

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
                    style={[styles.modalButton, { backgroundColor: "#1077a7ff" }]}
                    onPress={saveChanges}
                  >
                    <Text style={{ color: "#fff" }}>Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </VirtualizedList>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1077a7ff",
    marginBottom: 20,
    marginTop: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1077a7ff",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 50,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1077a7ff",
    marginHorizontal: 20
  },
  card: {
    backgroundColor: "#ebf5fcff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  cardSubtitle: { color: "#475569", marginTop: 4 },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginHorizontal: 20,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "100%",
    maxHeight: "90%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  inputContainer: { marginBottom: 10 },
  inputLabel: { fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
});
