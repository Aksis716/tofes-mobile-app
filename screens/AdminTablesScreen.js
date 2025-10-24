import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
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

export default function AdminTablesScreen() {
  const [poules, setPoules] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [assists, setAssists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [collectionKey, setCollectionKey] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const poulesSnap = await getDocs(collection(db, "poules"));
      const scorersSnap = await getDocs(collection(db, "scorers"));
      const assistsSnap = await getDocs(collection(db, "assists"));

      setPoules(poulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setScorers(scorersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setAssists(assistsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

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
          ],
        },
        {
          id: "pouleB",
          group: "Poule B",
          teams: [
            { team: "Falcons", pts: 24, mp: 10, w: 7, d: 3, l: 0, gf: 19, ga: 7, gd: 12 },
            { team: "Panthers", pts: 19, mp: 10, w: 6, d: 1, l: 3, gf: 15, ga: 11, gd: 4 },
          ],
        },
        {
          id: "pouleC",
          group: "Poule C",
          teams: [
            { team: "Wolves", pts: 17, mp: 10, w: 5, d: 2, l: 3, gf: 14, ga: 13, gd: 1 },
            { team: "Tigers", pts: 13, mp: 10, w: 4, d: 1, l: 5, gf: 12, ga: 16, gd: -4 },
          ],
        },
      ];

      const scorersData = [
        { id: "1", player: "John Doe", team: "Eagles", goals: 12 },
        { id: "2", player: "Ali Karim", team: "Falcons", goals: 10 },
      ];

      const assistsData = [
        { id: "1", player: "Mohamed Salah", team: "Lions", assists: 9 },
        { id: "2", player: "Carlos Silva", team: "Falcons", assists: 7 },
      ];

      for (let p of poulesData) await setDoc(doc(db, "poules", p.id), p);
      for (let s of scorersData) await setDoc(doc(db, "scorers", s.id), s);
      for (let a of assistsData) await setDoc(doc(db, "assists", a.id), a);

      Alert.alert("✅ Done", "Dummy data added successfully!");
      fetchData();
    } catch (err) {
      console.error("Error creating dummy data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (item, key) => {
    setSelectedItem(item);
    setCollectionKey(key);
    setModalVisible(true);
  };

  const saveChanges = async () => {
    if (!selectedItem || !collectionKey) return;

    try {
      const ref = doc(db, collectionKey, selectedItem.id);
      await updateDoc(ref, selectedItem);
      Alert.alert("✅ Updated!", "Data saved successfully.");
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error updating:", error);
      Alert.alert("❌ Error", "Failed to update data.");
    }
  };

  const renderList = (title, data, key) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openEditModal(item, key)}
          >
            <Text style={styles.cardTitle}>
              {item.group || item.player || item.team}
            </Text>
            {item.teams && (
              <Text style={styles.cardSubtitle}>
                {item.teams.length} équipes
              </Text>
            )}
            {item.goals && (
              <Text style={styles.cardSubtitle}>{item.goals} buts</Text>
            )}
            {item.assists && (
              <Text style={styles.cardSubtitle}>{item.assists} passes</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

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
    <ScrollView>
      <Text style={styles.title}>⚙️ Admin Tables</Text>

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
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Modifier</Text>

            {Object.entries(selectedItem || {}).map(([key, value]) => {
              if (key === "id" || key === "teams") return null; // skip arrays
              return (
                <View key={key} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{key}</Text>
                  <TextInput
                    style={styles.input}
                    value={String(value)}
                    onChangeText={(text) =>
                      setSelectedItem({ ...selectedItem, [key]: text })
                    }
                  />
                </View>
              );
            })}

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
          </View>
        </View>
      </Modal>
    </ScrollView>
    </VirtualizedList>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1077a7ff", marginBottom: 20, textAlign: "center" },
  button: {
    backgroundColor: "#1077a7ff",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#1E293B" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  cardSubtitle: { color: "#475569", marginTop: 4 },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "90%",
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
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
});
