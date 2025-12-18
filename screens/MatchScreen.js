import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

import CommentsTab from "../components/match/CommentsTab";
import EventsTab from "../components/match/EventsTab";
import LineupsTab from "../components/match/LineupsTab";
import MediaTab from "../components/match/MediaTab";
import TableTab from "../components/match/TableTab";

const Tab = createMaterialTopTabNavigator();
const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 380;

export default function MatchScreen({ route }) {
  const { match, matchId } = route.params;
  const navigation = useNavigation();

  const [currentMatch, setCurrentMatch] = useState({ ...match, id: matchId });
  const [countdown, setCountdown] = useState("");
  const [status, setStatus] = useState("upcoming");

  const teamLogos = {
    AVIONS: require("../assets/images/teams/AVIONS.png"),
    EDA: require("../assets/images/teams/EDA.png"),
    ETAA: require("../assets/images/teams/ETAA.png"),
    CRDA: require("../assets/images/teams/CRDA.png"),
    BFA: require("../assets/images/teams/CFA.png"),
    MAF: require("../assets/images/teams/MAF.png"),
    INFIRMERIE: require("../assets/images/teams/Infirmerie.png"),
    CHASSE: require("../assets/images/teams/Chasse.png"),
    HELICOS: require("../assets/images/teams/Helicos.png"),
    EMAA: require("../assets/images/teams/EMAA.png"),
    FUAES: require("../assets/images/teams/FUAES.png"),
    DRONES: require("../assets/images/teams/Drones.png"),
    OSA: require("../assets/images/teams/OSA.png"),
    MGX: require("../assets/images/teams/MGX.png"),
    EMART: require("../assets/images/teams/EMART.png"),
    default: require("../assets/images/teams/TeamLogo.png"),
  };

  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;

    if (typeof dateStr === "object" && typeof dateStr.toDate === "function") {
      return dateStr.toDate();
    }
    if (typeof dateStr === "object" && typeof dateStr.seconds === "number") {
      return new Date(dateStr.seconds * 1000);
    }

    if (typeof dateStr === "string" && !isNaN(Date.parse(dateStr))) {
      return new Date(dateStr);
    }

    if (typeof dateStr === "string") {
      let safeTime = typeof timeStr === "string" ? timeStr : "";
      if (!safeTime || safeTime.toLowerCase().includes("confirmer"))
        safeTime = "00:00";

      const parts = dateStr.includes("-")
        ? dateStr.split("-")
        : dateStr.split("/");
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

  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = onSnapshot(doc(db, "fixtures", matchId), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentMatch({ id: matchId, ...snapshot.data() });
      }
    });

    return () => unsubscribe();
  }, [matchId]);

  function TableScreen() {
    return <TableTab match={currentMatch} />;
  }
  function LineupsScreen() {
    return <LineupsTab match={currentMatch} />;
  }
  function EventsScreen() {
    return <EventsTab match={currentMatch} />;
  }
  function CommentsScreen() {
    return <CommentsTab match={currentMatch} />;
  }
  function MediaScreen() {
    return <MediaTab match={currentMatch} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.team}>
            <Image
              source={teamLogos[currentMatch.team1] || teamLogos.default}
              style={styles.logo}
            />
            <Text style={styles.teamName} numberOfLines={1}>
              {currentMatch.team1}
            </Text>
          </View>

          <View style={styles.center}>
            <Text style={styles.phase} numberOfLines={1}>
              {currentMatch.phase}
            </Text>
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
                {status === "live" && (
                  <Text style={[styles.statusBox, { backgroundColor: "#4caf50" }]}>
                    EN COURS
                  </Text>
                )}
                {status === "finished" && (
                  <Text style={[styles.statusBox, { backgroundColor: "#f44336" }]}>
                    TERMINÉ
                  </Text>
                )}
              </>
            )}
          </View>

          <View style={styles.team}>
            <Image
              source={teamLogos[currentMatch.team2] || teamLogos.default}
              style={styles.logo}
            />
            <Text style={styles.teamName} numberOfLines={1}>
              {currentMatch.team2}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: "#1077a7",
              tabBarInactiveTintColor: "#9daeb6ff",
              tabBarIndicatorStyle: { backgroundColor: "#1077a7", height: 3 },
              tabBarShowLabel: false,
              swipeEnabled: true,
              lazy: true,
            }}
          >
            <Tab.Screen
              name="Table"
              component={TableScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="trophy" size={22} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Lineups"
              component={LineupsScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="account-group"
                    size={22}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Events"
              component={EventsScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="soccer" size={22} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Comments"
              component={CommentsScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="message-text"
                    size={22}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Media"
              component={MediaScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="camera" size={22} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 2 : 0,
  },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.001,
    backgroundColor: "#f8fcffff",
    borderRadius: 20,
    margin: width * 0.005,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  team: {
    alignItems: "center",
    flex: 1,
    minWidth: width * 0.25,
    marginHorizontal: -40,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: "contain",
  },
  teamName: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: height * 0.008,
    color: "#1077a7",
    fontSize: isSmallDevice ? 13 : 15,
  },
  center: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  phase: {
    color: "#1077a7",
    fontWeight: "bold",
    marginBottom: height * 0.02,
    fontSize: isSmallDevice ? 13 : 15,
  },
  date: { fontSize: isSmallDevice ? 12 : 14, color: "#333", marginBottom: height * 0.02 },
  countdown: {
    fontSize: isSmallDevice ? 12 : 14,
    color: "#b80000ff",
    textAlign: "center",
  },
  scoreRow: { flexDirection: "row", alignItems: "center" },
  score: { fontSize: isSmallDevice ? 24 : 30, fontWeight: "bold", color: "#000" },
  vs: { fontSize: isSmallDevice ? 20 : 24, marginHorizontal: 4 },
  statusBox: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "600",
    marginTop: 6,
    fontSize: isSmallDevice ? 10 : 12,
    textAlign: "center",
  },
  tabs: { flex: 1 },
});
