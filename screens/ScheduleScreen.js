// screens/ScheduleScreen.js
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function ScheduleScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchFixtures() {
      try {
        setLoading(true);
        setError(null);

        const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        const fetched = snapshot.docs.map((d) => {
          const data = d.data();
          // Support Firestore Timestamp or ISO string
          let dateObj = null;
          if (data?.date && typeof data.date === "object" && data.date.seconds) {
            dateObj = new Date(data.date.seconds * 1000);
          } else if (data?.date) {
            // try parse ISO string or other string formats
            const parsed = new Date(data.date);
            if (!isNaN(parsed.getTime())) dateObj = parsed;
          }
          return {
            id: d.id,
            ...data,
            _dateObj: dateObj,
          };
        });

        if (mounted) {
          setFixtures(fetched);
        }
      } catch (e) {
        console.error("Error fetching fixtures:", e);
        if (mounted) setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFixtures();
    return () => {
      mounted = false;
    };
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🗓️ Calendrier des Rencontres</Text>

      {fixtures.map((match) => {
        const d = match._dateObj;
        const dateText = d ? d.toLocaleDateString() : (match.date || "Date à définir");
        const timeText = d
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : (match.time || (match.hour ? match.hour : "TBD"));

        const phase = match.phase || "Phase inconnue";
        const phaseStyle =
          phase === "Final" || phase === "Finale"
            ? styles.finalPhase
            : String(phase).includes("Demi-Finales")
            ? styles.semiPhase
            : String(phase).includes("Poule A")
            ? styles.groupAPhase
            : String(phase).includes("Poule B")
            ? styles.groupBPhase
            : String(phase).includes("Poule C")
            ? styles.groupCPhase
            : styles.defaultPhase;

        return (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.headerRow}>
              <Text style={styles.date}>
                {dateText} • {timeText}
              </Text>
              <Text style={[styles.phase, phaseStyle]}>{phase}</Text>
            </View>

            <View style={styles.teamsContainer}>
              <View style={styles.team}>
                <Image
                  source={require("../assets/images/teams/TeamLogo.png")}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{match.team1 || "Team 1"}</Text>
              </View>

              <Text style={styles.vs}>vs</Text>

              <View style={styles.team}>
                <Image
                  source={require("../assets/images/teams/TeamLogo.png")}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{match.team2 || "Team 2"}</Text>
              </View>
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1077a7ff",
    marginBottom: 15,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 12,
    marginBottom: 12,
    paddingRight: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
    alignItems: "center",
  },
  date: { fontSize: 14, fontWeight: "700", color: "#1077a7ff" },
  phase: {
    fontSize: 12,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: "hidden",
    color: "#fff",
  },
  groupAPhase: { backgroundColor: "#1077a7ff" },
  groupBPhase: { backgroundColor: "#10a74aff" },
  groupCPhase: { backgroundColor: "#a71077ff" },
  semiPhase: { backgroundColor: "#f5a623" },
  finalPhase: { backgroundColor: "#d0021b" },
  defaultPhase: { backgroundColor: "#4d6145ff" },

  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: -5,
    marginBottom: -5,
    paddingVertical: 1,
    paddingHorizontal: 20,
  },
  team: { alignItems: "center", width: 110 },
  teamLogo: { width: 50, height: 50, resizeMode: "contain", marginBottom: -5 },
  teamName: { fontSize: 14, fontWeight: "600", color: "#333", textAlign: "center" },
  vs: { fontWeight: "bold", color: "#1077a7ff", fontSize: 16 },
});
