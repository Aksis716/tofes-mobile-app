import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { db } from "../firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [nextMatch, setNextMatch] = useState(null);
  const [countdown, setCountdown] = useState("");
  const { width, height } = useWindowDimensions();

  const teamLogos = {
    AVIONS: require("../assets/images/teams/AVIONS.png"),
    EDA: require("../assets/images/teams/EDA.png"),
    ETAA: require("../assets/images/teams/ETAA.png"),
    CRDA: require("../assets/images/teams/CRDA.png"),
    BFA: require("../assets/images/teams/CFA.png"),
    MAF: require("../assets/images/teams/MAF.png"),
    CHASSE: require("../assets/images/teams/Chasse.png"),
    INFIRMERIE: require("../assets/images/teams/Infirmerie.png"),
    HELICOS: require("../assets/images/teams/Helicos.png"),
    EMAA: require("../assets/images/teams/EMAA.png"),
    FUAES: require("../assets/images/teams/FUAES.png"),
    DRONES: require("../assets/images/teams/Drones.png"),
    OSA: require("../assets/images/teams/OSA.png"),
    MGX: require("../assets/images/teams/MGX.png"),
    EMART: require("../assets/images/teams/EMART.png"),
    default: require("../assets/images/teams/TeamLogo.png"),
  };

  // 📏 Responsive scaling based on screen width
  const scale = width / 375; // 375 = iPhone X baseline
  const fontScale = Math.min(scale * 1.1, 1.3);

  useEffect(() => {
    const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const now = new Date();
      const upcomingMatches = matches.filter((m) => {
        const matchDate = m.date?.toDate ? m.date.toDate() : new Date(m.date);
        return matchDate > now;
      });

      if (upcomingMatches.length > 0) {
        setNextMatch(upcomingMatches[0]);
      } else {
        setNextMatch(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!nextMatch) return;

    const matchDate = nextMatch.date?.toDate
      ? nextMatch.date.toDate()
      : new Date(nextMatch.date);

    const interval = setInterval(() => {
      const diff = matchDate - new Date();
      if (diff <= 0) {
        setCountdown("Coup d’envoi !");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}j ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingHorizontal: width * 0.01, marginBottom: height * 0.12, marginHorizontal: width * 0.02 },
      ]}
      contentContainerStyle={{ paddingBottom: height * 0.1 }}
    >
      <Text
        style={[
          styles.header,
          { fontSize: 16 * fontScale, marginTop: height * 0.02 },
        ]}
      >
        Tournoi de Football des Escadrons et Services
      </Text>

      <Text style={[styles.title, { fontSize: 12 * fontScale }]}>
        4ème Édition - Décembre 2025
      </Text>

      <View
        style={[
          styles.midImage,
          {
            marginTop: -height * 0.02,
            marginBottom: -height * 0.02,
          },
        ]}
      >
        <Image
          source={require("../assets/images/Tournoi.png")}
          style={{
            width: width * 0.75,
            height: width * 0.75,
          }}
          resizeMode="contain"
        />
      </View>

      <View
        style={[
          styles.paragraph,
          { paddingHorizontal: width * 0.02, paddingBottom: height * 0.005 },
        ]}
      >
        <Text style={[styles.text, { fontSize: 13 * fontScale }]}>
          Le sport constitue un élément important de la vie quotidienne des
          militaires. Les activités sportives, en particulier celles qui se font
          en équipe, permettent de développer, renforcer et maintenir un esprit
          de cohésion et de compétitivité saine au sein de nos Forces Armées.
        </Text>

        <Text style={[styles.text, { fontSize: 13 * fontScale }]}>
          C’est dans cette optique qu’une compétition de football a été initiée
          au sein de la Base Aérienne 101. Elle oppose les différents Escadrons
          et Services dans un tournoi en poules suivi d’une phase à élimination
          directe.
        </Text>
      </View>

      <View
        style={[
          styles.buttonsContainer,
          {
            flexDirection: width < 400 ? "column" : "row",
            alignItems: "center",
            justifyContent:
              width < 400 ? "center" : "space-evenly",
          },
        ]}
      >
        {/* Palmarès Card */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.trophiesCard,
            {
              width: width < 400 ? "80%" : "45%",
              padding: width * 0.02,
            },
          ]}
          onPress={() => navigation.navigate("Palmarès 🏆")}
        >
          <Text style={[styles.cardEmoji, { fontSize: 15 * fontScale }]}>🏆</Text>
          <Text style={[styles.cardTitle, { fontSize: 13 * fontScale }]}>
            Palmarès
          </Text>
          <Text style={[styles.cardSubtitle, { fontSize: 11 * fontScale }]}>
            Vainqueurs et Distinctions
          </Text>
          <Text style={[styles.cardSubtitle, { fontSize: 11 * fontScale }]}>
                
          </Text>
        </TouchableOpacity>

        {/* Next Match Card */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.nextMatchCard,
            {
              width: width < 400 ? "80%" : "45%",
              padding: width * 0.02,
            },
          ]}
          onPress={() => navigation.navigate("Matchs")}
        >
          <Text style={[styles.cardEmoji, { fontSize: 15 * fontScale }]}>⚽</Text>
          <Text style={[styles.cardTitle, { fontSize: 13 * fontScale }]}>
            Prochain Match
          </Text>

          {nextMatch ? (
            <>
              <Text
                style={[styles.cardSubtitle, { fontSize: 11 * fontScale }]}
              >
                Début :{" "}
                <Text style={[styles.countdown, { fontSize: 11 * fontScale }]}>
                  {countdown}
                </Text>
              </Text>

              {/* ✅ TEAM LOGOS + NAMES */}
              <View style={styles.matchRow}>
                <View style={styles.teamRow}>
                  <Image
                    source={teamLogos[nextMatch.team1] || teamLogos.default}
                    style={[styles.teamLogo, { width: 18 * scale, height: 18 * scale }]}
                  />
                  <Text style={[styles.cardSubtitle, { fontSize: 11 * fontScale }]}>
                    {nextMatch.team1}
                  </Text>
                </View>

                <Text style={[styles.cardSubtitle, { fontSize: 11 * fontScale, marginHorizontal: 6 }]}>
                  vs
                </Text>

                <View style={styles.teamRow}>
                  <Text style={[styles.cardSubtitle, { fontSize: 11 * fontScale }]}>
                    {nextMatch.team2}
                  </Text>
                  <Image
                    source={teamLogos[nextMatch.team2] || teamLogos.default}
                    style={[styles.teamLogo, { width: 18 * scale, height: 18 * scale }]}
                  />
                </View>
              </View>

            </>
          ) : (
            <Text
              style={[styles.cardSubtitle, { fontSize: 11 * fontScale }]}
            >
              Aucun match à venir
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginVertical: 10,
  },
  text: {
    color: "#333",
    marginBottom: 10,
    lineHeight: 22,
  },
  title: {
    fontWeight: "bold",
    color: "#1077a7ff",
    textAlign: "center",
  },
  header: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1077a7ff",
    textAlign: "center",
  },
  paragraph: {
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  midImage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: "#f8fcffff",
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  cardEmoji: {
    marginBottom: 1,
  },
  cardTitle: {
    fontWeight: "700",
    color: "#333",
  },
  cardSubtitle: {
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  trophiesCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#fbc02d",
  },
  nextMatchCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#1077a7ff",
  },
  countdown: {
    fontWeight: "bold",
    color: "#1077a7ff",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamLogo: {
    marginRight: 6,
    resizeMode: "contain",
  },
});
