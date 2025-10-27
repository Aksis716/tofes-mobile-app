import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig"; // make sure this path is correct

export default function TeamsScreen() {
  const teamLogos = {
  "Avions": require("../assets/images/teams/AVIONS.png"),
  "EDA": require("../assets/images/teams/EDA.png"),
  "CRDA": require("../assets/images/teams/CRDA.png"),
  // fallback if team not found
  default: require("../assets/images/teams/TeamLogo.png"),
  };

  const navigation = useNavigation();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch teams from Firestore
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "teams"));
        const teamsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => navigation.navigate("TeamDetails", { team: item })}
    >
      {/* ✅ Display logo (if stored as URL in Firestore) */}
      <Image
        source={teamLogos[item.name] || teamLogos.default}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.teamName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1077a7ff" />
        <Text>Chargement des équipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Les douze (12) équipes retenues pour la compétition sont indiquées ci-dessous. Elles
        s’affronteront dans un système de poules avant de passer aux matchs de qualification directe.
        Les détails sur chaque équipe peuvent être obtenus en cliquant sur son logo.
      </Text>

      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  text: {
    fontSize: 15,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
  },
  list: { paddingHorizontal: 1 },
  teamCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    marginVertical: 12,
    marginHorizontal: 8,
    padding: 10,
    borderRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logo: { width: 75, height: 75, marginBottom: 0 },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#1077a7ff",
  },
  coach: {
    fontSize: 12,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
