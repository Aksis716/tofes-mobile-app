// components/match/LineupsTab.js
import { User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function LineupsTab(props) {
  const match = props.match || props.route?.params?.match;
  const { width } = useWindowDimensions();
  const [showBench, setShowBench] = useState(false);

  if (!match) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#666" }}>Aucune donnée de match fournie.</Text>
      </View>
    );
  }

  const players1 = Array.isArray(match.players1) ? match.players1 : [];
  const players2 = Array.isArray(match.players2) ? match.players2 : [];

  const coach1 = match.coach1 || match.coachTeam1 || "Coach équipe 1";
  const coach2 = match.coach2 || match.coachTeam2 || "Coach équipe 2";

  const pitchWidth = Math.min(width * 0.96, 900);
  const pitchAspect = 1.5;
  const pitchHeight = Math.round(pitchWidth * pitchAspect);

  // 1 GK, 3 DEF, 3 MID, 1 FW
  const layoutPositions = [
    { x: 0.45, y: 0.07 },
    { x: 0.15, y: 0.22 },
    { x: 0.45, y: 0.18 },
    { x: 0.75, y: 0.22 },
    { x: 0.15, y: 0.38 },
    { x: 0.45, y: 0.30 },
    { x: 0.75, y: 0.38 },
    { x: 0.45, y: 0.43 },
  ];

  function mapPlayersToLayout(players) {
    const mapped = new Array(8).fill(null);
    players.forEach((p) => {
      const pos = Number(p.position);
      if (!Number.isNaN(pos) && pos >= 1 && pos <= 8) mapped[pos - 1] = p;
    });
    const leftovers = players.filter((p) => {
      const pos = Number(p.position);
      return Number.isNaN(pos) || pos < 1 || pos > 8 || mapped[pos - 1] !== p;
    });
    for (let i = 0; i < mapped.length && leftovers.length > 0; i++) {
      if (!mapped[i]) mapped[i] = leftovers.shift();
    }
    return mapped;
  }

  const team1Layout = mapPlayersToLayout(players1);
  const team2Layout = mapPlayersToLayout(players2);

  const playerBadge = (p) => {
    if (!p) return "";
    let badge = "";
    if (Array.isArray(p.goals) && p.goals.length > 0) badge += `⚽${p.goals.length} `;
    if (p.yellow) badge += "🟨";
    if (p.red) badge += "🟥";
    if (p.injury) badge += " 🚑";
    return badge.trim();
  };

  const renderPlayer = (p, idx, teamColor, flipVertical = false) => {
    const layout = layoutPositions[idx];
    if (!layout) return null;

    const x = layout.x * pitchWidth;
    const y = layout.y * pitchHeight;
    const posY = flipVertical ? pitchHeight - y : y;

    return (
      <View
        key={(p && (p.id || p.name)) || `empty-${idx}-${flipVertical ? "t2" : "t1"}`}
        style={[
          styles.playerWrapper,
          { left: Math.round(x - 20), top: Math.round(posY - 20) },
        ]}
      >
        {/* Player icon + badge container */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBox, { backgroundColor: teamColor }]}>
            <User color="#fff" size={18} />
            {p && playerBadge(p) ? (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{playerBadge(p)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Player number */}
        {p?.position ? (
          <Text style={styles.playerNumber}>{p.position}</Text>
        ) : (
          <Text style={styles.playerNumber}>–</Text>
        )}

        {/* Player name */}
        <Text style={styles.playerName} numberOfLines={1}>
          {p?.name ?? ""}
        </Text>
      </View>
    );
  };

  const renderPitch = () => (
    <>
      <View style={{ width: pitchWidth, alignItems: "center", marginBottom: 6 }}>
        <Text style={styles.coachTopText}>👨‍🏫 Coach: {coach1}</Text>
      </View>

      <View style={[styles.pitchContainer, { width: pitchWidth, height: pitchHeight }]}>
        <Image
          source={require("../../assets/images/Lineups.png")}
          style={{ width: pitchWidth, height: pitchHeight, position: "absolute" }}
          resizeMode="stretch"
        />
        {team1Layout.map((p, i) => renderPlayer(p, i, "#1077a7", false))}
        {team2Layout.map((p, i) => renderPlayer(p, i, "#a71010", true))}
      </View>

      <View style={{ width: pitchWidth, alignItems: "center", marginTop: 8 }}>
        <Text style={styles.coachBottomText}>👨‍🏫 Coach: {coach2}</Text>
      </View>
    </>
  );

  const renderBench = () => (
    <View style={[styles.benchContainer, { width: pitchWidth }]}>
      <View style={styles.benchColumn}>
        <Text style={styles.benchTitle}>{match.team1 || "Equipe 1"}</Text>
        {players1
          .filter((p) => Number(p.position) > 8 || Number.isNaN(Number(p.position)))
          .map((p) => (
            <Text key={p.id || p.name} style={styles.benchItem}>
              {p.position ? `${p.position}. ` : ""}
              {p.name} {playerBadge(p) ? `· ${playerBadge(p)}` : ""}
            </Text>
          ))}
      </View>
      <View style={styles.benchColumn}>
        <Text style={styles.benchTitle}>{match.team2 || "Equipe 2"}</Text>
        {players2
          .filter((p) => Number(p.position) > 8 || Number.isNaN(Number(p.position)))
          .map((p) => (
            <Text key={p.id || p.name} style={styles.benchItem}>
              {p.position ? `${p.position}. ` : ""}
              {p.name} {playerBadge(p) ? `· ${playerBadge(p)}` : ""}
            </Text>
          ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showBench && styles.activeButton]}
          onPress={() => setShowBench(false)}
        >
          <Text style={[styles.toggleText, !showBench && styles.activeText]}>
            Titulaires
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showBench && styles.activeButton]}
          onPress={() => setShowBench(true)}
        >
          <Text style={[styles.toggleText, showBench && styles.activeText]}>
            Remplaçants
          </Text>
        </TouchableOpacity>
      </View>

      {!showBench ? renderPitch() : renderBench()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },

  toggleContainer: {
    flexDirection: "row",
    marginBottom: 15,
    marginTop: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginHorizontal: 10,
    borderColor: "#1077a7",
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  toggleText: { color: "#1077a7", fontWeight: "600" },
  activeButton: { backgroundColor: "#1077a7" },
  activeText: { color: "#fff" },

  pitchContainer: {
    position: "relative",
    borderRadius: 14,
    backgroundColor: "#eaf7ff",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  playerWrapper: { position: "absolute", alignItems: "center", width: 80 },
  iconContainer: { position: "relative", alignItems: "center", justifyContent: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: -2,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 9, fontWeight: "600" },

  playerNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffffff",
    marginTop: -10,
    backgroundColor: "#000000ff",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: -2,
  },
  playerName: {
    marginTop: -2,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    color: "#000",
  },

  coachTopText: { fontSize: 15, fontWeight: "600", color: "#0b5070", marginBottom: 4 },
  coachBottomText: { fontSize: 15, fontWeight: "600", color: "#7a0b0b", marginBottom: 15 },

  benchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
    paddingHorizontal: 6,
    borderRadius: 15,
    backgroundColor: "#f8fcffff",
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  benchColumn: { width: "48%", alignItems: "center" },
  benchTitle: { fontWeight: "700", marginBottom: 20, marginTop: 20, fontSize: 17, color: "#1077a7" },
  benchItem: { marginBottom: 30, color: "#333" },
});
