import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {

  const nextMatchDate = new Date('2025-10-28T07:45:00'); // Change this to your next match date
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = nextMatchDate - new Date();
      if (diff <= 0) {
        setCountdown('Kickoff!');
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.header}>Tournoi de Football des Escadrons et Services</Text>

      <Text style={styles.title}>4ème Edition - Décembre 2025</Text>

      <View style={styles.midImage}>
        <Image
          source={require('../assets/images/Tournoi.png')}  // relative path
          style={styles.image}
          resizeMode="contain"  // or "cover", "stretch", etc.
        />
      </View>

      <View style={styles.paragraph}>
        <Text style={styles.text}>Le sport constitue un élément important de la vie quotidienne des militaires. Les activités sportives,
          en particulier celles qui se font en équipe, permettent de développer, renforcer et maintenir un esprit de cohésion et de
          compétitivité saine au sein de nos Forces Armées.</Text>

        <Text style={styles.text}>C'est dans cette optique qu'une compétition de football a été initiée au sein de la Base Aérienne 101. Elle
        oppose les différents Escadrons et Services dans un tournoi en poules suivi d'une phase à élimination directe. </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.trophiesCard]}
          onPress={() => navigation.navigate('Palmarès 🏆')}
        >
          <Text style={styles.cardEmoji}>🏆</Text>
          <Text style={styles.cardTitle}>Palmarès</Text>
          <Text style={styles.cardSubtitle}>Vainqueurs et Distinctions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.nextMatchCard]}
          onPress={() => navigation.navigate('Matchs')}
        >
          <Text style={styles.cardEmoji}>⚽</Text>
          <Text style={styles.cardTitle}>Prochain Match</Text>
          <Text style={styles.cardSubtitle}>Début: <Text style={styles.countdown}>{countdown}</Text></Text>
          <Text style={styles.cardDate}>{format(nextMatchDate, 'EEEE d MMM yyyy, HH:mm')}</Text>
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
    width: 320, // must set width and height!
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