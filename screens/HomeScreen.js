import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [nextMatch, setNextMatch] = useState(null);
  const [liveMatch, setLiveMatch] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [search, setSearch] = useState("");

  const { width, height } = useWindowDimensions();

  const teamLogos = {
    AVIONS: require("../assets/images/teams/AVIONS.png"),
    EDA: require("../assets/images/teams/EDA.png"),
    ETAA: require("../assets/images/teams/ETAA.png"),
    CRDA: require("../assets/images/teams/CRDA.png"),
    BFA: require("../assets/images/teams/CFA.png"),
    MAF: require("../assets/images/teams/MAF.png"),
    CHASSE: require("../assets/images/teams/Chasse.png"),
    INFIRMERIE: require("../assets/images/teams/Infirmerie.png"),
    HELICOS: require("../assets/images/teams/Helicos.png"),
    EMAA: require("../assets/images/teams/EMAA.png"),
    FUAES: require("../assets/images/teams/FUAES.png"),
    DRONES: require("../assets/images/teams/Drones.png"),
    OSA: require("../assets/images/teams/OSA.png"),
    MGX: require("../assets/images/teams/MGX.png"),
    EMART: require("../assets/images/teams/EMART.png"),
    default: require("../assets/images/teams/TeamLogo.png"),
  };

  /* ======================
     📅 MATCHS
  ======================= */
  useEffect(() => {
    const q = query(collection(db, "fixtures"), orderBy("date", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();

      const matches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const ongoing = matches.find((m) => {
        const kickoff = m.date?.toDate ? m.date.toDate() : new Date(m.date);
        const end = new Date(kickoff.getTime() + 90 * 60000);
        return now >= kickoff && now <= end;
      });

      const upcoming = matches.find((m) => {
        const d = m.date?.toDate ? m.date.toDate() : new Date(m.date);
        return d > now;
      });

      setLiveMatch(ongoing || null);
      setNextMatch(upcoming || null);
    });

    return () => unsub();
  }, []);

  /* ======================
     ⏱️ COUNTDOWN
  ======================= */
  useEffect(() => {
    if (!nextMatch) return;

    const matchDate = nextMatch.date.toDate();

    const interval = setInterval(() => {
      const diff = matchDate - new Date();
      if (diff <= 0) {
        setCountdown("Coup d’envoi !");
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown(`${d}j ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  /* ======================
     📰 ARTICLES
  ======================= */
  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingArticles(false);
    });

    return () => unsub();
  }, []);

  /* ======================
     🔍 FILTRAGE
  ======================= */
  const filteredArticles = useMemo(() => {
    const term = search.toLowerCase();
    return articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(term) ||
        a.content?.toLowerCase().includes(term)
    );
  }, [search, articles]);

  /* ======================
     🕒 FORMAT DATE
  ======================= */
  const formatDate = (createdAt) => {
    if (!createdAt?.toDate) return "";
    const date = createdAt.toDate();
    const diffH = (Date.now() - date.getTime()) / 36e5;

    if (diffH < 1) return `Publié il y a ${Math.floor(diffH * 60)} min`;
    if (diffH < 24) return `Publié il y a ${Math.floor(diffH)} h`;

    return `Posté le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const isNewArticle = (createdAt) =>
    createdAt?.toDate &&
    Date.now() - createdAt.toDate().getTime() < 24 * 60 * 60 * 1000;

  /* ======================
     🎨 UI
  ======================= */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: height * 0.12 }}>
      
      {/* ======================
         🎯 MATCHS
      ======================= */}
      <View style={styles.matchContainer}>
        {liveMatch && (
          <TouchableOpacity style={[styles.card, styles.liveMatchCard, styles.half]} onPress={() => navigation.navigate("Matchs")}>
            <Text style={styles.cardTitle}>Match en cours</Text>
            <View style={styles.matchRow}>
              <Image source={teamLogos[liveMatch.team1] || teamLogos.default} style={styles.teamLogo} />
              <Text style={styles.cardSubtitle}>{liveMatch.team1}</Text>
              <Text style={styles.cardSubtitle}> vs </Text>
              <Text style={styles.cardSubtitle}>{liveMatch.team2}</Text>
              <Image source={teamLogos[liveMatch.team2] || teamLogos.default} style={styles.teamLogo} />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.card,
            styles.nextMatchCard,
            liveMatch ? styles.half : styles.full,
          ]}
          onPress={() => navigation.navigate("Matchs")}
        >
          <Text style={styles.cardTitle}>Prochain Match</Text>

          {nextMatch && (
            liveMatch ? (
              <>
                <Text style={styles.countdown}>{countdown}</Text>
                <View style={styles.matchRow}>
                  <Image source={teamLogos[nextMatch.team1] || teamLogos.default} style={styles.teamLogo} />
                  <Text style={styles.cardSubtitle}>{nextMatch.team1} vs {nextMatch.team2}</Text>
                  <Image source={teamLogos[nextMatch.team2] || teamLogos.default} style={styles.teamLogo} />
                </View>
              </>
            ) : (
              <View style={styles.fullMatchRow}>
                <Image source={teamLogos[nextMatch.team1] || teamLogos.default} style={styles.bigLogo} />
                <View>
                  <Text style={styles.countdown}>{countdown}</Text>
                  <Text style={styles.cardSubtitle}>{nextMatch.team1} vs {nextMatch.team2}</Text>
                </View>
                <Image source={teamLogos[nextMatch.team2] || teamLogos.default} style={styles.bigLogo} />
              </View>
            )
          )}
        </TouchableOpacity>
      </View>

      {/* ARTICLES */}
      <Text style={styles.sectionTitle}>Actualités du Tournoi</Text>

      <TextInput
        placeholder="Rechercher un article..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {loadingArticles ? (
        <ActivityIndicator size="large" color="#1077a7" />
      ) : (
        filteredArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => navigation.navigate("Détails de l’Article", { articleId: article.id })}
          >
            {article.imageUrl && <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />}

            {isNewArticle(article.createdAt) && (
                  <View style={styles.badge}><Text style={styles.badgeText}>Nouveau</Text></View>
                )}

            <View style={styles.articleContent}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                
              </View>

              <Text numberOfLines={2} style={styles.articleText}>{article.content}</Text>

              <View style={styles.articleFooter}>
                <Text style={styles.articleDate}>{formatDate(article.createdAt)}</Text>
                <Text style={styles.views}>👁️ {article.views || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

/* ======================
   🎨 STYLES
====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", paddingHorizontal: 12 },
  matchContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 4,
    elevation: 4,
  },
  half: { width: "48%" },
  full: { width: "100%" },

  cardTitle: { fontWeight: "700", textAlign: "center", color: "#12465fff" },
  cardSubtitle: { color: "#555", marginTop: 4 },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  teamLogo: { width: 18, height: 18, marginHorizontal: 4 },
  bigLogo: { width: 60, height: 60 },

  countdown: { fontWeight: "bold", color: "#1077a7", textAlign: "center" },

  liveMatchCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#fb2d2dff",
  },
  nextMatchCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#1077a7ff",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 12,
    color: "#1077a7",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    elevation: 4,
  },

  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 4,
  },
  articleImage: { width: "100%", height: 110 },
  articleContent: { padding: 12 },

  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  articleTitle: { fontSize: 15, fontWeight: "700", color: "#1077a7" },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  articleText: { marginTop: 4, color: "#555" },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  articleDate: { fontSize: 11, color: "#888" },
  views: { fontSize: 11, color: "#555" },
});
