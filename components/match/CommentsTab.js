import { Ionicons } from "@expo/vector-icons";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function CommentsTab({ match }) {
  const matchId = match?.id || match?.matchId || match?.match?.id;
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null); // ✅ track role
  const [currentUser, setCurrentUser] = useState(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✅ Fetch user role when logged in
  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);

    const fetchRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (err) {
          console.error("Erreur de récupération du rôle :", err);
        }
      }
    };

    fetchRole();
  }, []);

  // 🔹 Real-time listener for comments
  useEffect(() => {
    if (!matchId) {
      setComments([]);
      return;
    }

    const ref = doc(db, "fixtures", matchId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const fetched = Array.isArray(data.comments) ? data.comments : [];
          const sorted = fetched
            .slice()
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
          setComments(sorted);
        } else {
          setComments([]);
        }
      },
      (err) => {
        console.error("Error fetching comments:", err);
        Alert.alert("Erreur", "Impossible de charger les commentaires.");
      }
    );

    return () => unsubscribe(); // Clean up listener
  }, [matchId]);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: showForm ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const resetForm = () => {
    setAuthor("");
    setTitle("");
    setText("");
  };

  const handleAddComment = async () => {
    if (!title.trim() || !text.trim()) {
      Alert.alert("Champs manquants", "Merci d'indiquer un titre et un texte.");
      return;
    }

    const newComment = {
      id: makeId(),
      author: author?.trim() || "Anonyme",
      title: title.trim(),
      text: text.trim(),
      addedAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
    resetForm();

    if (!matchId) {
      Alert.alert("Erreur", "Impossible d’enregistrer le commentaire (match ID manquant).");
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, "fixtures", matchId);
      await updateDoc(ref, { comments: arrayUnion(newComment) });
      setSaving(false);
    } catch (err) {
      setSaving(false);
      console.error(err);
      Alert.alert("Erreur", "Le commentaire n’a pas pu être enregistré dans la base.");
    }
  };

  // 🔹 Delete comment
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
              const ref = doc(db, "fixtures", matchId);
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

  const renderItem = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.author ? item.author[0].toUpperCase() : "A"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentTitle}>{item.title}</Text>
          <Text style={styles.commentAuthor}>{item.author}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.commentTime}>
            {new Date(item.addedAt).toLocaleString()}
          </Text>

          {/* ✅ Delete icon only for admin or creator */}
          {currentUser && (userRole === "admin" || userRole === "creator") && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item)}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 230}
    >
      <View style={styles.container}>
        {comments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Aucun commentaire pour le moment — soyez le premier !
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Slide-up Add Comment Form */}
        {showForm && (
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [200, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.formHeader}>Ajouter un commentaire</Text>

            <TextInput
              style={styles.input}
              placeholder="Votre nom (optionnel)"
              value={author}
              onChangeText={setAuthor}
            />

            <TextInput
              style={styles.input}
              placeholder="Titre"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Votre commentaire..."
              value={text}
              onChangeText={setText}
              multiline
            />

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#eee" }]}
                onPress={resetForm}
              >
                <Text style={{ color: "#333" }}>Effacer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#1077a7" }]}
                onPress={handleAddComment}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Publier</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* 🔹 Floating Add Comment Button — visible only if logged in */}
        {currentUser && (
          <TouchableOpacity style={styles.fab} onPress={toggleForm}>
            <Ionicons
              name={showForm ? "close" : "chatbubble-ellipses"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

// ✅ All styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  emptyBox: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#777", fontStyle: "italic" },
  commentCard: {
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#e4e9ec",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1077a7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  commentTitle: { fontWeight: "700", fontSize: 14 },
  commentAuthor: { color: "#666", fontSize: 12 },
  commentTime: { color: "#999", fontSize: 11 },
  commentText: { color: "#222", lineHeight: 18, marginTop: 5 },
  fab: {
    position: "absolute",
    bottom: 150,
    right: 20,
    backgroundColor: "#1077a7",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f9fcff",
    padding: 14,
    paddingBottom: 80,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  formHeader: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1077a7",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e3ea",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
