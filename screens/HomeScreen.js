import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig"; // make sure path is correct

export default function HomeScreen({ navigation }) {
  const [nextMatch, setNextMatch] = useState(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter matches with a future date
      const now = new Date();
      const upcomingMatches = matches.filter((m) => {
        const matchDate = m.date?.toDate ? m.date.toDate() : new Date(m.date);
        return matchDate > now;
      });

      // Get the next one
      if (upcomingMatches.length > 0) {
        const next = upcomingMatches[0];
        setNextMatch(next);
      } else {
        setNextMatch(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Countdown logic
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Tournoi de Football des Escadrons et Services
      </Text>

      <Text style={styles.title}>4ème Édition - Décembre 2025</Text>

      <View style={styles.midImage}>
        <Image
          source={require("../assets/images/Tournoi.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.paragraph}>
        <Text style={styles.text}>
          Le sport constitue un élément important de la vie quotidienne des
          militaires. Les activités sportives, en particulier celles qui se font
          en équipe, permettent de développer, renforcer et maintenir un esprit
          de cohésion et de compétitivité saine au sein de nos Forces Armées.
        </Text>

        <Text style={styles.text}>
          C’est dans cette optique qu’une compétition de football a été initiée
          au sein de la Base Aérienne 101. Elle oppose les différents Escadrons
          et Services dans un tournoi en poules suivi d’une phase à élimination
          directe.
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        {/* Palmarès Card */}
        <TouchableOpacity
          style={[styles.card, styles.trophiesCard]}
          onPress={() => navigation.navigate("Palmarès 🏆")}
        >
          <Text style={styles.cardEmoji}>🏆</Text>
          <Text style={styles.cardTitle}>Palmarès</Text>
          <Text style={styles.cardSubtitle}>Vainqueurs et Distinctions</Text>
        </TouchableOpacity>

        {/* Next Match Card */}
        <TouchableOpacity
          style={[styles.card, styles.nextMatchCard]}
          onPress={() => navigation.navigate("Matchs")}
        >
          <Text style={styles.cardEmoji}>⚽</Text>
          <Text style={styles.cardTitle}>Prochain Match</Text>

          {nextMatch ? (
            <>
              <Text style={styles.cardSubtitle}>
                Début : <Text style={styles.countdown}>{countdown}</Text>
              </Text>
              <Text style={styles.cardSubtitle}>
                {nextMatch.team1} vs {nextMatch.team2}
              </Text>
            </>
          ) : (
            <Text style={styles.cardSubtitle}>Aucun match à venir</Text>
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
    marginHorizontal: 5,
    marginVertical: 10,
    elevation: 1,
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1077a7ff",
    textAlign: "center",
  },
  header: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 30,
    color: "#1077a7ff",
    textAlign: "center",
  },
  paragraph: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  image: {
    width: 320,
    height: 320,
  },
  midImage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -25,
    marginBottom: -25,
  },
  buttonsContainer: {
    paddingHorizontal: 5,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 5,
    margin: 5,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
    width: "45%",
  },
  cardEmoji: {
    fontSize: 20,
    marginBottom: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 13,
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
  cardDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },
});
