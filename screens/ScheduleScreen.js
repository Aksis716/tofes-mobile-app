import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

// ✅ Full schedule, sorted by date/time
const schedule = [
  // Poule A (6 games)
  { id: "1", phase: "Poule A", date: "25 Oct 2025", time: "14:00", team1: "Team A", team2: "Team B" },
  { id: "2", phase: "Poule A", date: "26 Oct 2025", time: "16:00", team1: "Team C", team2: "Team D" },
  { id: "3", phase: "Poule A", date: "27 Oct 2025", time: "15:30", team1: "Team A", team2: "Team C" },
  { id: "4", phase: "Poule A", date: "28 Oct 2025", time: "18:00", team1: "Team B", team2: "Team D" },
  { id: "5", phase: "Poule A", date: "29 Oct 2025", time: "17:00", team1: "Team D", team2: "Team A" },
  { id: "6", phase: "Poule A", date: "30 Oct 2025", time: "19:00", team1: "Team B", team2: "Team C" },

  // Poule B (6 games)
  { id: "7", phase: "Poule B", date: "31 Oct 2025", time: "14:00", team1: "Team E", team2: "Team F" },
  { id: "8", phase: "Poule B", date: "01 Nov 2025", time: "16:00", team1: "Team G", team2: "Team H" },
  { id: "9", phase: "Poule B", date: "02 Nov 2025", time: "15:30", team1: "Team E", team2: "Team G" },
  { id: "10", phase: "Poule B", date: "03 Nov 2025", time: "18:00", team1: "Team F", team2: "Team H" },
  { id: "11", phase: "Poule B", date: "04 Nov 2025", time: "17:00", team1: "Team H", team2: "Team E" },
  { id: "12", phase: "Poule B", date: "05 Nov 2025", time: "19:00", team1: "Team F", team2: "Team G" },

  // Semi-finals (2 games)
  { id: "13", phase: "Demi-Finale", date: "08 Nov 2025", time: "18:00", team1: "1er Poule A", team2: "2e Poule B" },
  { id: "14", phase: "Demi-Finale", date: "09 Nov 2025", time: "21:00", team1: "1er Poule B", team2: "2e Poule A" },

  // Finale (1 game)
  { id: "15", phase: "Finale", date: "12 Nov 2025", time: "20:00", team1: "Gagnant DF1", team2: "Gagnant DF2" },
];

export default function ScheduleScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🗓️ Calendrier des Rencontres</Text>

      {schedule.map((match) => (
        <View key={match.id} style={styles.matchCard}>
          {/* Header with date and phase */}
          <View style={styles.headerRow}>
            <Text style={styles.date}>{match.date} - {match.time}</Text>
            <Text style={[styles.phase, 
              match.phase === "Finale"
                ? styles.finalPhase
                : match.phase.includes("Demi")
                ? styles.semiPhase
                : styles.groupPhase]}>
              {match.phase}
            </Text>
          </View>

          {/* Teams */}
          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <Image
                source={require("../assets/images/teams/TeamLogo.png")}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>{match.team1}</Text>
            </View>

            <Text style={styles.vs}>vs</Text>

            <View style={styles.team}>
              <Image
                source={require("../assets/images/teams/TeamLogo.png")}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>{match.team2}</Text>
            </View>
          </View>
        </View>
      ))}

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
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  date: { fontSize: 14, fontWeight: "bold", color: "#1077a7ff" },
  phase: {
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: "hidden",
    color: "#fff",
  },
  groupPhase: { backgroundColor: "#1077a7ff" },
  semiPhase: { backgroundColor: "#f5a623" },
  finalPhase: { backgroundColor: "#d0021b" },

  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: 5,
  },
  team: { alignItems: "center" },
  teamLogo: { width: 40, height: 40, resizeMode: "contain", marginBottom: 4 },
  teamName: { fontSize: 14, fontWeight: "600", color: "#333" },
  vs: { fontWeight: "bold", color: "#1077a7ff", fontSize: 16 },
});
