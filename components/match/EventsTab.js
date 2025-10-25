import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function EventsTab({ match }) {
  if (!match) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#666" }}>Aucune donnée de match disponible.</Text>
      </View>
    );
  }

  const players1 = Array.isArray(match.players1) ? match.players1 : [];
  const players2 = Array.isArray(match.players2) ? match.players2 : [];

  // Helper to flatten and tag events by type
  const extractEvents = (players, team, color) => {
    const result = [];

    players.forEach((p) => {
      // Goals (array of minutes)
      if (Array.isArray(p.goals) && p.goals.length > 0) {
        p.goals.forEach((m) =>
          result.push({ player: p.name, minute: m, type: "goal", team, color })
        );
      }

      // Yellow card (minute number)
      if (p.yellow && !isNaN(Number(p.yellow))) {
        result.push({ player: p.name, minute: Number(p.yellow), type: "yellow", team, color });
      }

      // Red card (minute number)
      if (p.red && !isNaN(Number(p.red))) {
        result.push({ player: p.name, minute: Number(p.red), type: "red", team, color });
      }

      // Injury (boolean or minute)
      if (p.injury && !isNaN(Number(p.injury))) {
        result.push({ player: p.name, minute: Number(p.injury), type: "injury", team, color });
      }
    });

    return result;
  };

  const goals = [
    ...extractEvents(players1, "team1", "#1077a7").filter((e) => e.type === "goal"),
    ...extractEvents(players2, "team2", "#a71010").filter((e) => e.type === "goal"),
  ].sort((a, b) => a.minute - b.minute);

  const cards = [
    ...extractEvents(players1, "team1", "#1077a7").filter(
      (e) => e.type === "yellow" || e.type === "red"
    ),
    ...extractEvents(players2, "team2", "#a71010").filter(
      (e) => e.type === "yellow" || e.type === "red"
    ),
  ].sort((a, b) => a.minute - b.minute);

  const injuries = [
    ...extractEvents(players1, "team1", "#1077a7").filter((e) => e.type === "injury"),
    ...extractEvents(players2, "team2", "#a71010").filter((e) => e.type === "injury"),
  ].sort((a, b) => a.minute - b.minute);

  const renderEventRow = (e, index) => (
    <View
      key={`${e.player}-${e.minute}-${index}`}
      style={[
        styles.eventRow,
        e.team === "team1" ? styles.leftAlign : styles.rightAlign,
      ]}
    >
      {e.team === "team1" && (
        <Text style={[styles.minute, { color: e.color }]}>{e.minute}'</Text>
      )}

      <View style={styles.eventBox}>
        {e.type === "goal" && <Text style={styles.icon}>⚽</Text>}
        {e.type === "yellow" && <Text style={styles.icon}>🟨</Text>}
        {e.type === "red" && <Text style={styles.icon}>🟥</Text>}
        {e.type === "injury" && <Text style={styles.icon}>🚑</Text>}
        <Text style={[styles.playerName, { color: e.color }]}>{e.player}</Text>
      </View>

      {e.team === "team2" && (
        <Text style={[styles.minute, { color: e.color }]}>{e.minute}'</Text>
      )}
    </View>
  );

  const renderCard = (title, icon, data) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {icon} {title}
      </Text>

      {data.length > 0 ? (
        data.map(renderEventRow)
      ) : (
        <Text style={styles.noEvent}>Aucun événement enregistré</Text>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {renderCard("Buts", "⚽", goals)}
      {renderCard("Cartons", "🟨🟥", cards)}
      {renderCard("Blessures", "🚑", injuries)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 14,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#f8fcffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1077a7",
  },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 6,
  },
  leftAlign: { justifyContent: "flex-start" },
  rightAlign: { justifyContent: "flex-end" },

  eventBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: "#eee",
  },

  icon: { fontSize: 14 },
  playerName: { fontWeight: "600", fontSize: 12 },
  minute: {
    fontWeight: "bold",
    marginHorizontal: 8,
    fontSize: 13,
    color: "#1077a7",
  },
  noEvent: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    marginVertical: 4,
  },
});
