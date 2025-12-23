import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db, storage } from "../firebaseConfig";

export default function AdminArticles() {
  const [activeTab, setActiveTab] = useState("create");
  const [articles, setArticles] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  /* ---------- REALTIME LISTENER ---------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "articles"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );
      setArticles(data);
    });

    return () => unsub();
  }, []);

  /* ---------- IMAGE PICKER ---------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  /* ---------- UPLOAD IMAGE ---------- */
  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `articles/${Date.now()}.jpg`;
    const imageRef = ref(storage, fileName);

    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  /* ---------- CREATE / UPDATE ---------- */
  const saveArticle = async () => {
    if (!title || !content) {
      Alert.alert("Erreur", "Titre et contenu obligatoires");
      return;
    }

    try {
      let imageUrl = null;
      if (image?.uri) imageUrl = await uploadImage(image.uri);

      if (editingId) {
        await updateDoc(doc(db, "articles", editingId), {
          title,
          content,
          ...(imageUrl && { imageUrl }),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "articles"), {
          title,
          content,
          imageUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      resetForm();
      setActiveTab("manage");
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteArticle = async (id) => {
    Alert.alert(
      "Confirmation",
      "Supprimer cet article ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () =>
            await deleteDoc(doc(db, "articles", id)),
        },
      ]
    );
  };

  const editArticle = (a) => {
    setTitle(a.title);
    setContent(a.content);
    setImage(null);
    setEditingId(a.id);
    setActiveTab("create");
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setEditingId(null);
  };

  /* ---------- UI ---------- */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* TOGGLES */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "create" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("create")}
        >
          <Text style={styles.tabText}>
            ➕ Créer un article
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "manage" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("manage")}
        >
          <Text style={styles.tabText}>
            ✏️ Gérer les articles
          </Text>
        </TouchableOpacity>
      </View>

      {/* CREATE / EDIT */}
      {activeTab === "create" && (
        <View style={styles.card}>
          <Text style={styles.title}>
            {editingId ? "Modifier l'article" : "Nouvel article"}
          </Text>

          <TextInput
            placeholder="Titre de l'article"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Contenu de l'article"
            style={[styles.input, { height: 120 }]}
            value={content}
            onChangeText={setContent}
            multiline
          />

          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImage}
          >
            <Text style={styles.imageText}>
              📷 Choisir une image de couverture
            </Text>
          </TouchableOpacity>

          {image && (
            <Image
              source={{ uri: image.uri }}
              style={styles.preview}
            />
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveArticle}
          >
            <Text style={styles.saveText}>
              {editingId ? "Mettre à jour" : "Publier"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MANAGE */}
      {activeTab === "manage" &&
        articles.map((a) => (
          <View key={a.id} style={styles.articleCard}>
            {a.imageUrl && (
              <Image
                source={{ uri: a.imageUrl }}
                style={styles.articleImage}
              />
            )}

            <Text style={styles.articleTitle}>{a.title}</Text>
            <Text style={styles.date}>
              📅{" "}
              {a.createdAt?.toDate().toLocaleString()}
            </Text>

            <Text style={styles.content} numberOfLines={3}>
              {a.content}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => editArticle(a)}
              >
                <Text style={styles.edit}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteArticle(a.id)}
              >
                <Text style={styles.delete}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </ScrollView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tab: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  activeTab: { backgroundColor: "#1077a7" },
  tabText: { color: "#fff", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 10,
    color: "#1077a7",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  imageButton: {
    padding: 10,
    backgroundColor: "#eef6fb",
    borderRadius: 10,
    marginBottom: 10,
  },
  imageText: { textAlign: "center" },
  preview: { height: 180, borderRadius: 12, marginBottom: 10 },
  saveButton: {
    backgroundColor: "#1077a7",
    padding: 12,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  articleImage: { height: 160, borderRadius: 12 },
  articleTitle: { fontWeight: "700", fontSize: 16, marginTop: 6 },
  date: { fontSize: 12, color: "#666" },
  content: { marginTop: 6, color: "#333" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  edit: { color: "#1077a7", fontWeight: "600" },
  delete: { color: "#dc2626", fontWeight: "600" },
});
