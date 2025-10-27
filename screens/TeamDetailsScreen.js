import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../firebaseConfig";

export default function TeamDetailsScreen({ route }) {
  const { team } = route.params;
  const [teamData, setTeamData] = useState(team || null);
  const [loading, setLoading] = useState(!team || !team.players);

  const teamLogos = {
  "Avions": require("../assets/images/teams/AVIONS.png"),
  "EDA": require("../assets/images/teams/EDA.png"),
  "CRDA": require("../assets/images/teams/CRDA.png"),
  // fallback if team not found
  default: require("../assets/images/teams/TeamLogo.png"),
  };

  useEffect(() => {
    const fetchTeam = async () => {
      if (!team.id) return;
      try {
        const docRef = doc(db, "teams", team.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTeamData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!team.players) fetchTeam();
  }, [team]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1077a7ff" />
        <Text>Chargement des détails de l’équipe...</Text>
      </View>
    );
  }

  const players = teamData?.players || [];

  const renderPlayer = ({ item }) => (
    <View style={styles.playerRow}>
      <Icon name="person-outline" size={22} color="#1077a7ff" />
      <Text style={styles.playerNumber}>#{item.number}</Text>
      <Text style={styles.playerName}>{item.name}</Text>
      <Text style={styles.playerPosition}>{item.position}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={teamLogos[teamData.name] || teamLogos.default}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.teamName}>{teamData?.name}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.info}>🏙️ Nom Complet: {teamData?.fullname}</Text>
        <Text style={styles.info}>👔 Coach: {teamData?.coach}</Text>
        <Text style={styles.info}>⚽ Nombre de joueurs: {players.length}</Text>
        <Text style={styles.info}>
          ⭐ Tournois remportés: {teamData?.trophies}
        </Text>
      </View>

      <Text style={styles.playersTitle}>👟  Joueurs Enregistrés</Text>

      {players.length > 0 ? (
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.playersList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noPlayers}>
          Aucun joueur enregistré pour cette équipe.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  logo: { width: 150, height: 150, alignSelf: "center", marginBottom: 1, marginTop: -20 },
  teamName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1077a7ff",
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: "#f8fcffff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  info: { fontSize: 16, marginBottom: 5 },
  playersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#1077a7ff",
  },
  playersList: { paddingBottom: 40 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  playerNumber: { fontWeight: "bold", color: "#1077a7ff", marginHorizontal: 8 },
  playerName: { flex: 1, fontSize: 16, color: "#333" },
  playerPosition: { fontSize: 14, color: "gray" },
  noPlayers: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
