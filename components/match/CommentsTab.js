import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function CommentsTab({ match }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "matches", match.id, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  const handleSend = async () => {
    if (!comment.trim()) return;
    await addDoc(collection(db, "matches", match.id, "comments"), {
      text: comment,
      user: auth.currentUser?.displayName || "Anonyme",
      createdAt: serverTimestamp(),
    });
    setComment("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.user}>{item.user}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Ajouter un commentaire..."
          value={comment}
          onChangeText={setComment}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.button}>
          <Text style={{ color: "#fff" }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  comment: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  user: { fontWeight: "bold" },
  inputContainer: { flexDirection: "row", padding: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#1077a7",
    padding: 10,
    marginLeft: 10,
    borderRadius: 8,
  },
});
