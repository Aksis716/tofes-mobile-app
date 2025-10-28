import { Ionicons } from "@expo/vector-icons";
import {
  arrayRemove,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

export default function AdminCommentsScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [comments, setComments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Listen for real-time updates of fixtures
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fixtures"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFixtures(data);
        setFilteredFixtures(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading fixtures:", error);
        Alert.alert("Erreur", "Impossible de charger les données.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 Search filter
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredFixtures(fixtures);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = fixtures.filter(
      (f) =>
        (f.team1 && f.team1.toLowerCase().includes(lower)) ||
        (f.team2 && f.team2.toLowerCase().includes(lower)) ||
        (f.phase && f.phase.toLowerCase().includes(lower))
    );
    setFilteredFixtures(filtered);
  };

  // 🔹 Open modal & load comments for selected fixture
  const openCommentsModal = (fixture) => {
    setSelectedFixture(fixture);
    setLoadingComments(true);
    setModalVisible(true);

    const fixtureRef = doc(db, "fixtures", fixture.id);
    const unsubscribe = onSnapshot(
      fixtureRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const commentsData = Array.isArray(data.comments)
            ? data.comments
            : [];
          const sorted = commentsData.sort(
            (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
          );
          setComments(sorted);
        } else {
          setComments([]);
        }
        setLoadingComments(false);
      },
      (error) => {
        console.error("Error fetching comments:", error);
        Alert.alert("Erreur", "Impossible de charger les commentaires.");
        setLoadingComments(false);
      }
    );

    return unsubscribe;
  };

  // 🔹 Delete a comment
  const handleDeleteComment = async (comment) => {
    Alert.alert(
      "Supprimer le commentaire",
      "Voulez-vous vraiment supprimer ce commentaire ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const ref = doc(db, "fixtures", selectedFixture.id);
              await updateDoc(ref, { comments: arrayRemove(comment) });
            } catch (err) {
              console.error(err);
              Alert.alert("Erreur", "Impossible de supprimer le commentaire.");
            }
          },
        },
      ]
    );
  };

  // 🔹 Determine background color by phase
  const getPhaseColor = (phase) => {
    const p = (phase || "").toLowerCase();
    if (p.includes("groupe")) return "#aad5ffff";
    if (p.includes("quart")) return "#fef8f9";
    if (p.includes("demi")) return "#f9fef8";
    if (p.includes("finale")) return "#fff9f3";
    return "#f9f9f9";
  };

  // 🔹 Render fixture card
  const renderItem = ({ item }) => {
    const commentsCount = Array.isArray(item.comments)
      ? item.comments.length
      : 0;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: getPhaseColor(item.phase) },
        ]}
      >
        <View style={styles.infoBox}>
          <Text style={styles.fixtureName}>
            {item.team1 && item.team2 ? `${item.team1} - ${item.team2}` : "Match"}
          </Text>
          <Text style={styles.phaseText}>{item.phase || "—"}</Text>
          <Text style={styles.dateText}>
            {item.date
              ? new Date(item.date.seconds * 1000).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </Text>
        </View>

        <View style={styles.commentsBox}>
          <Text style={styles.commentCount}>{commentsCount}</Text>
          <Text style={styles.commentLabel}>commentaires</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openCommentsModal(item)}
        >
          <Ionicons name="create-outline" size={20} color="#1077a7" />
        </TouchableOpacity>
      </View>
    );
  };

  // 🔹 Render comment inside modal
  const renderComment = (item) => (
    <View key={item.id} style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleDeleteComment(item)}>
          <Ionicons name="trash" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.commentAuthor}>
        {item.author || "Anonyme"} •{" "}
        {new Date(item.addedAt).toLocaleString("fr-FR")}
      </Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#1077a7" />
        <Text style={{ marginTop: 10, color: "#1077a7" }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔹 Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un match ou une phase..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {filteredFixtures.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Aucun match trouvé.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFixtures}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* 🔹 Comments Modal */}
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedFixture
                ? `${selectedFixture.team1} - ${selectedFixture.team2}`
                : ""}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1077a7" />
            </TouchableOpacity>
          </View>

          {loadingComments ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1077a7" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aucun commentaire trouvé.</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}
            >
              {comments.map((c) => renderComment(c))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

// 🧱 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },

  searchInput: {
    borderWidth: 1,
    borderColor: "#e4e9ec",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyBox: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#777", fontStyle: "italic" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b5e3ffff",
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
  },

  infoBox: { flex: 1 },
  fixtureName: { fontWeight: "700", fontSize: 15, color: "#1077a7" },
  phaseText: { fontSize: 13, color: "#666" },
  dateText: { fontSize: 12, color: "#999", marginTop: 2 },

  commentsBox: { alignItems: "center", marginHorizontal: 10 },
  commentCount: { fontWeight: "700", color: "#1077a7", fontSize: 16 },
  commentLabel: { fontSize: 11, color: "#666" },

  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#e9f4fb",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e9ec",
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1077a7" },

  commentCard: {
    backgroundColor: "#f9fcff",
    borderWidth: 1,
    borderColor: "#e4e9ec",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentTitle: { fontWeight: "700", color: "#1077a7", fontSize: 14 },
  commentAuthor: { color: "#666", fontSize: 12, marginBottom: 4 },
  commentText: { color: "#222", lineHeight: 18 },
});
