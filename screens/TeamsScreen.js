import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { db } from "../firebaseConfig";

export default function TeamsScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ dynamic scaling factors
  const scale = width / 400; // base on medium phone
  const numColumns = width < 400 ? 2 : width < 700 ? 3 : 4;

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
    const unsubscribe = onSnapshot(
      collection(db, "teams"),
      (snapshot) => {
        const teamsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to teams:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.teamCard,
        {
          padding: 8 * scale,
          marginHorizontal: 8 * scale,
          marginVertical: 10 * scale,
          borderRadius: 24 * scale,
        },
      ]}
      onPress={() => navigation.navigate("TeamDetails", { team: item })}
    >
      <Image
        source={teamLogos[item.name] || teamLogos.default}
        style={{
          width: 75 * scale,
          height: 75 * scale,
          marginBottom: 4 * scale,
        }}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.teamName,
          {
            fontSize: 15 * scale,
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1077a7" />
        <Text>Chargement des équipes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: 20 * scale }]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: 14 * scale,
            marginHorizontal: 15 * scale,
            marginBottom: 10 * scale,
          },
        ]}
      >
        Les douze (12) équipes retenues pour la compétition sont indiquées ci-dessous. Elles
        s’affronteront dans un système de poules avant de passer aux matchs de qualification
        directe. Les détails sur chaque équipe peuvent être obtenus en cliquant sur son logo.
      </Text>

      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{
          paddingHorizontal: 6 * scale,
          paddingBottom: 80 * scale,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  text: {
    color: "#222",
    textAlign: "justify",
  },
  teamCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  teamName: {
    fontWeight: "600",
    textAlign: "center",
    color: "#1077a7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
