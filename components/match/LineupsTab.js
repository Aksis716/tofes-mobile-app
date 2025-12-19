import { doc, getDoc } from "firebase/firestore";
import { User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function LineupsTab(props) {
  const match = props.match || props.route?.params?.match;
  const { width } = useWindowDimensions();
  const [showBench, setShowBench] = useState(false);

  /* ---------- User state ---------- */
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);

    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentRole(data.role);
          }
        } catch (err) {
          console.error("Erreur récupération utilisateur :", err);
        }
      };

      fetchUserData();
    }
  }, []);

  if (!match) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#666" }}>Aucune donnée de match fournie.</Text>
      </View>
    );
  }

  /* ---------- Lineup visibility rules ---------- */
  const matchDate = match.date?.toDate
    ? match.date.toDate()
    : new Date(match.date);

  const now = new Date();
  const diffHours = (matchDate - now) / (1000 * 60 * 60);

  const isAdminOrCreator =
    currentUser && (currentRole === "admin" || currentRole === "creator");

  const isAfterMatch = now >= matchDate;
  const isWithin12Hours = diffHours <= 12;

  const lineupsVisible =
    isAfterMatch || isWithin12Hours || isAdminOrCreator;

  /* ---------- Match data ---------- */
  const players1 = Array.isArray(match.players1) ? match.players1 : [];
  const players2 = Array.isArray(match.players2) ? match.players2 : [];

  const coach1 = match.coach1 || match.coachTeam1 || "Coach équipe 1";
  const coach2 = match.coach2 || match.coachTeam2 || "Coach équipe 2";

  /* ---------- Responsive sizing ---------- */
  const pitchWidth = Math.min(width * 0.94, 900);
  const pitchHeight = pitchWidth * 1.5;
  const scale = width / 390;

  /* ---------- 9-player layout ---------- */
  const layoutPositions = [
    { x: 0.41, y: 0.08 },
    { x: 0.13, y: 0.16 },
    { x: 0.41, y: 0.20 },
    { x: 0.69, y: 0.16 },
    { x: 0.07, y: 0.30 },
    { x: 0.41, y: 0.32 },
    { x: 0.75, y: 0.30 },
    { x: 0.25, y: 0.42 },
    { x: 0.57, y: 0.42 },
  ];

  /* ---------- Helpers ---------- */
  const getFirstTwoNames = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).join(" ");

  const mapPlayersToLayout = (players) => {
    const mapped = new Array(9).fill(null);

    players.forEach((p) => {
      const pos = Number(p.position);
      if (pos >= 1 && pos <= 9) mapped[pos - 1] = p;
    });

    return mapped;
  };

  const team1Layout = mapPlayersToLayout(players1);
  const team2Layout = mapPlayersToLayout(players2);

  const playerBadge = (p) => {
    if (!p) return "";
    let badge = "";
    if (Array.isArray(p.goals) && p.goals.length) badge += `⚽${p.goals.length} `;
    if (p.yellow) badge += "🟨";
    if (p.red) badge += "🟥";
    if (p.injury) badge += " 🚑";
    return badge.trim();
  };

  const renderPlayer = (p, idx, color, flip) => {
    if (!lineupsVisible) return null;

    const pos = layoutPositions[idx];
    if (!pos) return null;

    const x = pos.x * pitchWidth;
    const y = flip ? pitchHeight - pos.y * pitchHeight : pos.y * pitchHeight;

    return (
      <View
        key={`${idx}-${flip}`}
        style={[
          styles.playerWrapper,
          {
            left: x - 22 * scale,
            top: y - 22 * scale,
            width: 110 * scale,
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: color,
              width: 36 * scale,
              height: 36 * scale,
              borderRadius: 18 * scale,
            },
          ]}
        >
          <User color="#fff" size={18 * scale} />
          {p && playerBadge(p) ? (
            <View style={[styles.badgeContainer, { top: -4, right: -10 }]}>
              <Text style={[styles.badgeText, { fontSize: 9 * scale }]}>
                {playerBadge(p)}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.playerNumber, { fontSize: 11 * scale }]}>
          {p?.position ?? "–"}
        </Text>

        <Text
          style={[styles.playerName, { fontSize: 12 * scale }]}
          numberOfLines={1}
        >
          {p ? getFirstTwoNames(p.name) : ""}
        </Text>
      </View>
    );
  };

  /* ---------- Pitch ---------- */
  const renderPitch = () => (
    <>
      <Text style={[styles.coachTopText, { fontSize: 14 * scale }]}>
        👨‍🏫 Coach: {coach1}
      </Text>

      <View style={[styles.pitchContainer, { width: pitchWidth, height: pitchHeight }]}>
        <Image
          source={
            lineupsVisible
              ? require("../../assets/images/Lineups.png")
              : require("../../assets/images/NoLineups.png")
          }
          style={{ width: pitchWidth, height: pitchHeight, position: "absolute" }}
          resizeMode="stretch"
        />

        {team1Layout.map((p, i) => renderPlayer(p, i, "#1077a7", false))}
        {team2Layout.map((p, i) => renderPlayer(p, i, "#a71010", true))}

        {!lineupsVisible && (
          <View style={styles.notPublishedContainer}>
            <Text style={styles.notPublishedText}>
              ⏳ Les compositions d'équipe ne sont pas encore publiées. Elles seront disponibles 12h avant le coup d'envoi du match.
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.coachBottomText, { fontSize: 14 * scale }]}>
        👨‍🏫 Coach: {coach2}
      </Text>
    </>
  );

  /* ---------- Bench ---------- */
  const renderBench = () => {
    if (!lineupsVisible) return null;

    return (
      <View style={[styles.benchContainer, { width: pitchWidth }]}>
        {[players1, players2].map((team, idx) => (
          <View key={idx} style={styles.benchColumn}>
            <Text style={styles.benchTitle}>
              {idx === 0 ? match.team1 : match.team2}
            </Text>
            {team
              .filter((p) => Number(p.position) >= 10)
              .map((p) => (
                <Text key={p.id || p.name} style={styles.benchItem}>
                  {p.position}. {p.name}{" "}
                  {playerBadge(p) ? `· ${playerBadge(p)}` : ""}
                </Text>
              ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showBench && styles.activeButton]}
          onPress={() => setShowBench(false)}
        >
          <Text style={!showBench ? styles.activeText : styles.toggleText}>
            Titulaires
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showBench && styles.activeButton]}
          onPress={() => setShowBench(true)}
        >
          <Text style={showBench ? styles.activeText : styles.toggleText}>
            Remplaçants
          </Text>
        </TouchableOpacity>
      </View>

      {!showBench ? renderPitch() : renderBench()}
    </ScrollView>
  );
}

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  scrollContainer: { alignItems: "center", paddingBottom: 30 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  toggleContainer: { flexDirection: "row", marginVertical: 16 },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1077a7",
    marginHorizontal: 8,
    backgroundColor: "#fff",
  },
  toggleText: { color: "#1077a7", fontWeight: "600" },
  activeButton: { backgroundColor: "#1077a7" },
  activeText: { color: "#fff", fontWeight: "600" },

  pitchContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eaf7ff",
    alignItems: "center",
    justifyContent: "center",
  },

  notPublishedContainer: {
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
  },
  notPublishedText: { color: "#fff", fontWeight: "600", textAlign: "center" },

  playerWrapper: { position: "absolute", alignItems: "center" },
  iconBox: { alignItems: "center", justifyContent: "center" },
  badgeContainer: { position: "absolute", backgroundColor: "#fff", borderRadius: 6 },
  badgeText: { fontWeight: "600" },

  playerNumber: {
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "700",
    paddingHorizontal: 4,
    borderRadius: 6,
    marginTop: -6,
  },
  playerName: { fontWeight: "800", color: "#000", textAlign: "center" },

  coachTopText: { marginBottom: 6, color: "#0b5070", fontWeight: "600" },
  coachBottomText: {
    marginTop: 8,
    color: "#7a0b0b",
    fontWeight: "600",
    marginBottom: 30,
  },

  benchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  benchColumn: { width: "48%", alignItems: "center" },
  benchTitle: { fontWeight: "700", marginBottom: 12, color: "#1077a7" },
  benchItem: { marginBottom: 10, color: "#333" },
});
