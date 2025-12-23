import {
    doc,
    increment,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function ArticleDetailsScreen({ route }) {
  const { articleId } = route.params;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ======================
     👁️ INCRÉMENTATION VUES
  ======================= */
  useEffect(() => {
    if (!articleId) return;

    const incrementViews = async () => {
      try {
        const ref = doc(db, "articles", articleId);
        await updateDoc(ref, {
          views: increment(1),
        });
      } catch (err) {
        console.error("Erreur incrémentation vues :", err);
      }
    };

    incrementViews();
  }, [articleId]);

  /* ======================
     🔄 RÉCUPÉRATION ARTICLE
  ======================= */
  useEffect(() => {
    if (!articleId) return;

    const ref = doc(db, "articles", articleId);

    const unsub = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setArticle({
          id: snapshot.id,
          ...snapshot.data(),
        });
      } else {
        setArticle(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [articleId]);

  /* ======================
     ⏳ LOADING
  ======================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1077a7" />
        <Text style={styles.loadingText}>Chargement de l’article…</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Article introuvable</Text>
      </View>
    );
  }

  const publishedDate = article.createdAt?.toDate
    ? article.createdAt.toDate().toLocaleString("fr-FR")
    : "";

  /* ======================
     📰 AFFICHAGE
  ======================= */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {article.imageUrl && (
        <Image source={{ uri: article.imageUrl }} style={styles.coverImage} />
      )}

      <View style={styles.contentBox}>
        <Text style={styles.title}>{article.title}</Text>

        <Text style={styles.date}>Publié le {publishedDate}</Text>

        <View style={styles.separator} />

        <Text style={styles.content}>{article.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
  },

  coverImage: {
    width: "100%",
    height: 240,
  },

  contentBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginTop: -20,
    marginHorizontal: 12,
    padding: 18,
    elevation: 4,
    marginBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  content: {
    fontSize: 16,
    lineHeight: 26,
    color: "#1F2937",
    textAlign: "justify",
  },
});
