import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig"; // make sure this path is correct

export default function TeamsScreen() {
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
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
      ) : (
        <Image
          source={require("../assets/images/teams/TeamLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.coach}>Coach: {item.coach}</Text>
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
        Les huit (08) équipes retenues pour la compétition sont indiquées ci-dessous. Elles
        s’affronteront dans un système de poules avant de passer aux matchs de qualification directe.
        Les détails sur chaque équipe peuvent être obtenus en cliquant sur son logo.
      </Text>

      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
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
  list: { paddingHorizontal: 10 },
  teamCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 8,
    padding: 10,
    borderRadius: 12,
    elevation: 2,
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
