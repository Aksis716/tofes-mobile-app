import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../firebaseConfig";

export default function TeamDetailsScreen({ route }) {
  const { width } = useWindowDimensions();
  const scale = width / 400; // base scale for medium phone width

  const { team } = route.params;
  const [teamData, setTeamData] = useState(team || null);
  const [loading, setLoading] = useState(!team || !team.players);

  const teamLogos = {
    Avions: require("../assets/images/teams/AVIONS.png"),
    EDA: require("../assets/images/teams/EDA.png"),
    CRDA: require("../assets/images/teams/CRDA.png"),
    CFA: require("../assets/images/teams/CFA.png"),
    Hélicos: require("../assets/images/teams/Helicos.png"),
    EMAA: require("../assets/images/teams/EMAA.png"),
    FUAES: require("../assets/images/teams/FUAES.png"),
    Drones: require("../assets/images/teams/Drones.png"),
    OSA: require("../assets/images/teams/OSA.png"),
    MGX: require("../assets/images/teams/MGX.png"),
    EMART: require("../assets/images/teams/EMART.png"),
    default: require("../assets/images/teams/TeamLogo.png"),
  };

  useEffect(() => {
    if (!team.id) return;

    const unsubscribe = onSnapshot(
      doc(db, "teams", team.id),
      (docSnap) => {
        if (docSnap.exists()) {
          setTeamData({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to team details:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [team]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1077a7" />
        <Text>Chargement des détails de l’équipe...</Text>
      </View>
    );
  }

  const players = teamData?.players || [];

  return (
    <ScrollView
      style={[styles.container, { padding: 20 * scale }]}
      contentContainerStyle={{ paddingBottom: 50 * scale }}
      showsVerticalScrollIndicator={false}
    >
      {/* ✅ Team Header */}
      <Image
        source={teamLogos[teamData.name] || teamLogos.default}
        style={{
          width: 150 * scale,
          height: 150 * scale,
          alignSelf: "center",
          marginBottom: 10 * scale,
          marginTop: -5 * scale,
        }}
        resizeMode="contain"
      />

      <Text
        style={[
          styles.teamName,
          {
            fontSize: 22 * scale,
            marginBottom: 20 * scale,
          },
        ]}
      >
        {teamData?.name}
      </Text>

      {/* ✅ Team Info */}
      <View
        style={[
          styles.infoContainer,
          {
            padding: 12 * scale,
            borderRadius: 10 * scale,
            marginBottom: 20 * scale,
          },
        ]}
      >
        <Text style={[styles.info, { fontSize: 15 * scale }]}>
          🏙️ Nom Complet: {teamData?.fullname}
        </Text>
        <Text style={[styles.info, { fontSize: 15 * scale }]}>
          👔 Coach: {teamData?.coach}
        </Text>
        <Text style={[styles.info, { fontSize: 15 * scale }]}>
          ⚽ Nombre de joueurs: {players.length}
        </Text>
        <Text style={[styles.info, { fontSize: 15 * scale }]}>
          ⭐ Tournois remportés: {teamData?.trophies}
        </Text>
      </View>

      {/* ✅ Players List */}
      <Text
        style={[
          styles.playersTitle,
          { fontSize: 17 * scale, marginBottom: 10 * scale },
        ]}
      >
        👟 Joueurs Enregistrés
      </Text>

      {players.length > 0 ? (
        <View style={styles.playersList}>
          {players.map((player, index) => (
            <View
              key={index}
              style={[
                styles.playerRow,
                {
                  paddingVertical: 10 * scale,
                  paddingHorizontal: 12 * scale,
                  borderRadius: 8 * scale,
                  marginBottom: 8 * scale,
                },
              ]}
            >
              <Icon
                name="person-outline"
                size={22 * scale}
                color="#1077a7"
                style={{ marginRight: 6 * scale }}
              />
              <Text
                style={[
                  styles.playerNumber,
                  { fontSize: 14 * scale, marginHorizontal: 6 * scale },
                ]}
              >
                #{player.number}
              </Text>
              <Text
                style={[styles.playerName, { fontSize: 15 * scale }]}
                numberOfLines={1}
              >
                {player.name}
              </Text>
              <Text
                style={[styles.playerPosition, { fontSize: 13 * scale }]}
                numberOfLines={1}
              >
                {player.position}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text
          style={[
            styles.noPlayers,
            { fontSize: 14 * scale, marginTop: 20 * scale },
          ]}
        >
          Aucun joueur enregistré pour cette équipe.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  teamName: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#1077a7",
  },
  infoContainer: {
    backgroundColor: "#f8fcffff",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  info: {
    marginBottom: 5,
    color: "#333",
  },
  playersTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#1077a7",
  },
  playersList: {
    marginTop: 5,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  playerNumber: { fontWeight: "bold", color: "#1077a7" },
  playerName: { flex: 1, color: "#333" },
  playerPosition: { color: "gray" },
  noPlayers: {
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
