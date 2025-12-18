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
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [currentName, setCurrentName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  const [editingComment, setEditingComment] = useState(null); // ← NEW
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load user info
  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);

    if (user) {
      setCurrentEmail(user.email);

      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentName(data.fullName || data.name || "Utilisateur");
          }
        } catch (err) {
          console.error("Erreur récupération utilisateur :", err);
        }
      };

      fetchUserData();
    }
  }, []);

  // Load comments
  useEffect(() => {
    if (!matchId) return setComments([]);

    const ref = doc(db, "fixtures", matchId);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const fetched = snapshot.data().comments || [];
        const sorted = fetched
          .slice()
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        setComments(sorted);
      } else setComments([]);
    });

    return () => unsubscribe();
  }, [matchId]);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: showForm ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const makeId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const resetForm = () => {
    setTitle("");
    setText("");
    setEditingComment(null); // reset edit mode
  };

  // ADD NEW COMMENT
  const handleAddComment = async () => {
    if (!title.trim() || !text.trim()) {
      Alert.alert("Champs manquants", "Merci d'indiquer un titre et un texte.");
      return;
    }

    const newComment = {
      id: makeId(),
      author: currentName,
      authorEmail: currentEmail,
      title: title.trim(),
      text: text.trim(),
      addedAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
    resetForm();

    try {
      setSaving(true);
      const ref = doc(db, "fixtures", matchId);
      await updateDoc(ref, { comments: arrayUnion(newComment) });
      setSaving(false);
    } catch (err) {
      setSaving(false);
      console.error(err);
      Alert.alert("Erreur", "Le commentaire n’a pas pu être enregistré.");
    }
  };

  // DELETE COMMENT (own comments only)
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

  // ENABLE EDIT MODE
  const startEditing = (comment) => {
    setEditingComment(comment);
    setTitle(comment.title);
    setText(comment.text);
    if (!showForm) toggleForm();
  };

  // APPLY EDIT
  const handleEditComment = async () => {
    if (!editingComment) return;

    const updated = {
      ...editingComment,
      title: title.trim(),
      text: text.trim(),
    };

    try {
      setSaving(true);
      const ref = doc(db, "fixtures", matchId);

      await updateDoc(ref, { comments: arrayRemove(editingComment) });
      await updateDoc(ref, { comments: arrayUnion(updated) });

      setSaving(false);
      resetForm();
      toggleForm();
    } catch (err) {
      setSaving(false);
      console.error(err);
      Alert.alert("Erreur", "Impossible de modifier le commentaire.");
    }
  };

  // RENDER ITEM
  const renderItem = ({ item }) => {
    const isOwner = item.authorEmail === currentEmail;

    return (
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

            {isOwner && (
              <>
                <TouchableOpacity
                  onPress={() => startEditing(item)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="create" size={20} color="#1077a7" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteComment(item)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="trash" size={20} color="#ff4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    );
  };

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
            <Text style={styles.formHeader}>
              {editingComment ? "Modifier le commentaire" : "Ajouter un commentaire"}
            </Text>

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
                onPress={editingComment ? handleEditComment : handleAddComment}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {editingComment ? "Modifier" : "Publier"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

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
