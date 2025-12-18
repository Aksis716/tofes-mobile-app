// screens/ScheduleScreen.js
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Get device screen dimensions for responsive design
const { width, height } = Dimensions.get("window");

// Scale helper for font and component sizes
const scale = (size) => (width / 375) * size; // base iPhone 11 width
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export default function ScheduleScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const [expanded, setExpanded] = useState({
    poules: true,
    quarts: true,
    demis: true,
    finale: true,
  });

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => {
          const data = d.data();
          let dateObj = null;
          if (data?.date && typeof data.date === "object" && data.date.seconds) {
            dateObj = new Date(data.date.seconds * 1000);
          } else if (data?.date) {
            const parsed = new Date(data.date);
            if (!isNaN(parsed.getTime())) dateObj = parsed;
          }
          return { id: d.id, ...data, _dateObj: dateObj };
        });
        setFixtures(fetched);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error listening to fixtures:", err);
        setError(String(err));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1077a7ff" />
        <Text style={{ marginTop: 10 }}>Chargement du calendrier…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>Erreur : {error}</Text>
      </View>
    );
  }

  if (!fixtures || fixtures.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#666" }}>Aucun match programmé pour l'instant.</Text>
      </View>
    );
  }

  const renderMatches = (matches) =>
    matches.map((match) => {
      const d = match._dateObj;
      const dateText = d ? d.toLocaleDateString() : match.date || "Date à définir";
      const timeText = d
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : match.time || match.hour || "TBD";

      const phase = match.phase || "Phase inconnue";
      const phaseStyle =
        phase === "Final" || phase === "Finale"
          ? styles.finalPhase
          : String(phase).includes("Demi")
          ? styles.semiPhase
          : String(phase).includes("Poule A")
          ? styles.groupAPhase
          : String(phase).includes("Poule B")
          ? styles.groupBPhase
          : String(phase).includes("Poule C")
          ? styles.groupCPhase
          : String(phase).includes("Poule D")
          ? styles.groupDPhase
          : styles.defaultPhase;

      return (
        <View key={match.id} style={styles.matchCard}>
          <View style={styles.headerRow}>
            <Text style={styles.date}>{dateText} • {timeText}</Text>
            <Text style={[styles.phase, phaseStyle]}>{phase}</Text>
          </View>

          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <Image
                source={teamLogos[match.team1] || teamLogos.default}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>{match.team1 || "Team 1"}</Text>
            </View>

            <Text style={styles.vs}>vs</Text>

            <View style={styles.team}>
              <Text style={styles.teamName}>{match.team2 || "Team 2"}</Text>
              <Image
                source={teamLogos[match.team2] || teamLogos.default}
                style={styles.teamLogo}
              />
            </View>
          </View>
        </View>
      );
    });

  const pouleMatches = fixtures.filter((f) =>
    String(f.phase || "").toLowerCase().includes("poule")
  );
  const quartMatches = fixtures.filter((f) =>
    String(f.phase || "").toLowerCase().includes("quart")
  );
  const demiMatches = fixtures.filter((f) =>
    String(f.phase || "").toLowerCase().includes("demi")
  );
  const finaleMatches = fixtures.filter((f) => {
    const phase = String(f.phase || "").toLowerCase();
    return phase === "final" || phase === "finale";
  });

  const renderSection = (title, key, matches, emoji) => (
    <>
      <TouchableOpacity
        style={styles.phaseHeader}
        onPress={() => toggleSection(key)}
        activeOpacity={0.7}
      >
        <Text style={styles.phaseTitle}>
          {emoji} {title}
        </Text>
        <Text style={styles.toggleIcon}>{expanded[key] ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {expanded[key] && renderMatches(matches)}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scale(80) }}
      >
        <Text style={styles.title}>🗓️ Calendrier des Rencontres</Text>

        {pouleMatches.length > 0 && renderSection("Phase de Poules", "poules", pouleMatches, "⚽")}
        {quartMatches.length > 0 && renderSection("Quarts de Finale", "quarts", quartMatches, "🏆")}
        {demiMatches.length > 0 && renderSection("Demi-Finales", "demis", demiMatches, "🥇")}
        {finaleMatches.length > 0 && renderSection("Finale", "finale", finaleMatches, "🏅")}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(15),
    backgroundColor: "#f5f5f5",
    marginTop: scale(-20),
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: "bold",
    textAlign: "center",
    color: "#1077a7ff",
    marginVertical: scale(5),
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(10),
    backgroundColor: "#e7f3f7",
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    marginTop: scale(10),
  },
  phaseTitle: {
    fontSize: moderateScale(15),
    fontWeight: "bold",
    color: "#1077a7ff",
  },
  toggleIcon: {
    fontSize: moderateScale(16),
    color: "#1077a7ff",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  matchCard: {
    backgroundColor: "#f8fcffff",
    borderRadius: scale(12),
    paddingVertical: scale(8),
    paddingHorizontal: scale(10),
    marginBottom: scale(12),
    marginHorizontal: scale(10),
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: moderateScale(13), fontWeight: "700", color: "#1077a7ff" },
  phase: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    paddingVertical: scale(3),
    paddingHorizontal: scale(8),
    borderRadius: scale(10),
    overflow: "hidden",
    color: "#fff",
  },
  groupAPhase: { backgroundColor: "#1077a7ff" },
  groupBPhase: { backgroundColor: "#10a74aff" },
  groupCPhase: { backgroundColor: "#a71077ff" },
  groupDPhase: { backgroundColor: "#c44513ff" },
  semiPhase: { backgroundColor: "#f5a623" },
  finalPhase: { backgroundColor: "#d0021b" },
  defaultPhase: { backgroundColor: "#4d6145ff" },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(6),
  },
  team: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: width * 0.35,
  },
  teamLogo: {
    width: scale(45),
    height: scale(45),
    resizeMode: "contain",
  },
  teamName: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    flexShrink: 1,
  },
  vs: { fontWeight: "bold", color: "#1077a7ff", fontSize: moderateScale(16) },
});
