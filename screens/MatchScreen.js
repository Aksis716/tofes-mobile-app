import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { db } from "../firebaseConfig";

import CommentsTab from "../components/match/CommentsTab";
import EventsTab from "../components/match/EventsTab";
import LineupsTab from "../components/match/LineupsTab";
import TableTab from "../components/match/TableTab";

const Tab = createMaterialTopTabNavigator();

export default function MatchScreen({ route }) {
  const { match, matchId } = route.params;
  const navigation = useNavigation();

  const [currentMatch, setCurrentMatch] = useState({ ...match, id: matchId });
  const [countdown, setCountdown] = useState("");
  const [status, setStatus] = useState("upcoming"); // upcoming | live | finished

  // ---- Helper: Parse date safely ----
  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;

    // Handle Firestore Timestamps
    if (typeof dateStr === "object" && typeof dateStr.toDate === "function") {
      return dateStr.toDate();
    }
    if (typeof dateStr === "object" && typeof dateStr.seconds === "number") {
      return new Date(dateStr.seconds * 1000);
    }

    // Handle ISO date string
    if (typeof dateStr === "string" && !isNaN(Date.parse(dateStr))) {
      return new Date(dateStr);
    }

    // Handle manual format (dd/mm/yyyy or yyyy-mm-dd)
    if (typeof dateStr === "string") {
      let safeTime = typeof timeStr === "string" ? timeStr : "";
      if (!safeTime || safeTime.toLowerCase().includes("confirmer")) safeTime = "00:00";

      const parts = dateStr.includes("-") ? dateStr.split("-") : dateStr.split("/");
      let year, month, day;
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
      return new Date(`${year}-${month}-${day}T${safeTime}`);
    }

  return null;
};


  const formatDateForDisplay = (dateValue, timeValue) => {
    let dateObj = parseDateTime(dateValue, timeValue);
    if (!dateObj) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}${timeValue ? " " + timeValue : ""}`;
  };

  const matchDate = parseDateTime(match.date, match.time);

  // ---- Live Countdown ----
  useEffect(() => {
    if (!matchDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = matchDate - now;

      if (diff > 0) {
        setStatus("upcoming");
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else if (diff <= 0 && diff > -1 * 60 * 60 * 1000) {
        setStatus("live");
        setCountdown("Match en cours !");
      } else {
        setStatus("finished");
        setCountdown("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [matchDate]);

  // ---- Auto-update if match changes in Firestore ----
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = onSnapshot(doc(db, "fixtures", matchId), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentMatch({ id: matchId, ...snapshot.data() });
      }
    });

    return () => unsubscribe();
  }, [matchId]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Team 1 */}
        <View style={styles.team}>
          <Image source={require("../assets/images/teams/TeamLogo.png")} style={styles.logo} />
          <Text style={styles.teamName}>{currentMatch.team1}</Text>
        </View>

        {/* Center Section */}
        <View style={styles.center}>
          <Text style={styles.phase}>{currentMatch.phase}</Text>
          {status === "upcoming" ? (
            <>
              <Text style={styles.date}>
                {formatDateForDisplay(currentMatch.date, currentMatch.time)}
              </Text>
              <Text style={styles.countdown}>{countdown}</Text>
            </>
          ) : (
            <>
              <View style={styles.scoreRow}>
                <Text style={styles.score}>{currentMatch.score1 ?? "0"}</Text>
                <Text style={styles.vs}> - </Text>
                <Text style={styles.score}>{currentMatch.score2 ?? "0"}</Text>
              </View>
              {status === "live" && <Text style={[styles.statusBox, { backgroundColor: "#4caf50" }]}>EN COURS</Text>}
              {status === "finished" && <Text style={[styles.statusBox, { backgroundColor: "#f44336" }]}>TERMINÉ</Text>}
            </>
          )}
        </View>

        {/* Team 2 */}
        <View style={styles.team}>
          <Image source={require("../assets/images/teams/TeamLogo.png")} style={styles.logo} />
          <Text style={styles.teamName}>{currentMatch.team2}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#1077a7",
            tabBarInactiveTintColor: "#777",
            tabBarIndicatorStyle: { backgroundColor: "#1077a7" },
            tabBarLabelStyle: { fontSize: 14, fontWeight: "600" },
          }}
        >
          {/* 🏆 1. Table Tab */}
          <Tab.Screen name="Classement">
            {() => <TableTab match={currentMatch} />}
          </Tab.Screen>

          {/* 🧩 2. Lineups Tab */}
          <Tab.Screen name="Compos">
            {() => <LineupsTab match={currentMatch} />}
          </Tab.Screen>

          {/* ⚽ 3. Events Tab */}
          <Tab.Screen name="Événements">
            {() => <EventsTab match={currentMatch} />}
          </Tab.Screen>

          {/* 💬 4. Comments Tab */}
          <Tab.Screen name="Messages">
            {() => <CommentsTab match={currentMatch} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8fcffff",
    borderRadius: 20,
    margin: 5,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  team: { alignItems: "center", flex: 1 },
  teamName: { fontWeight: "bold", textAlign: "center", marginTop: 5, marginBottom: 15, color: "#1077a7" },
  logo: { width: 120, height: 120, resizeMode: "contain" },
  center: { flex: 1.4, alignItems: "center" },
  phase: { color: "#1077a7", fontWeight: "bold", marginBottom: 15, fontSize: 16 },
  date: { fontSize: 14, color: "#333", marginBottom: 15, fontSize: 15 },
  countdown: { fontSize: 14, color: "#b80000ff", marginTop: 4 },
  scoreRow: { flexDirection: "row", alignItems: "center" },
  score: { fontSize: 30, fontWeight: "bold", color: "#000" },
  vs: { fontSize: 24, marginHorizontal: 4 },
  statusBox: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "600",
    marginTop: 6,
    fontSize: 12,
  },
  tabs: { flex: 1 },
});
