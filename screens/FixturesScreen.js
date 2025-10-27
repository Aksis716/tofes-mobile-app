import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function FixturesScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('Prochain Match');
  const [countdown, setCountdown] = useState('');
  const navigation = useNavigation();

  const phases = [
    'Prochain Match',
    'Poule A',
    'Poule B',
    'Poule C',
    'Quarts de Finale',
    'Demi-Finales',
    'Finale'
  ];

  // ✅ Fetch fixtures with proper date/time parsing
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const q = query(collection(db, 'fixtures'), orderBy('date', 'asc'));
        const snapshot = await getDocs(q);

        const fetched = snapshot.docs.map(doc => {
          const data = doc.data();

          // Handle Firestore Timestamp or ISO string
          let dateObj = null;
          if (data?.date && typeof data.date === 'object' && data.date.seconds) {
            dateObj = new Date(data.date.seconds * 1000);
          } else if (data?.date) {
            const parsed = new Date(data.date);
            if (!isNaN(parsed.getTime())) dateObj = parsed;
          }

          return { id: doc.id, ...data, _dateObj: dateObj };
        });

        setFixtures(fetched);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      }
    };

    fetchFixtures();
  }, []);

  // ✅ Sort chronologically
  const sortedFixtures = [...fixtures].sort((a, b) => {
    const dateA = a._dateObj || new Date(0);
    const dateB = b._dateObj || new Date(0);
    return dateA - dateB;
  });

  // ✅ Determine next match
  const now = new Date();
  const nextMatch = sortedFixtures.find((m) => m._dateObj && m._dateObj > now);

  // ✅ Filter by phase
  const filteredMatches =
    selectedPhase === 'Prochain Match'
      ? sortedFixtures
      : sortedFixtures.filter((m) => m.phase === selectedPhase);

  // ✅ Countdown timer
  useEffect(() => {
    if (!nextMatch || !nextMatch._dateObj) return;

    const matchDateTime = nextMatch._dateObj;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = matchDateTime - now;

      if (diff <= 0) {
        setCountdown('Match en cours !');
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

  // ✅ Navigate to match screen
  const handlePressMatch = (match) => {
    // Remove _dateObj before sending to navigation
    const { _dateObj, ...serializableMatch } = match;
    navigation.navigate('Détails du Match', {
      matchId: match.id,
      match: serializableMatch,
    });
  };

  // ✅ Format date/time for display
  const formatDateTime = (match) => {
    const d = match._dateObj;
    const dateText = d
      ? d.toLocaleDateString()
      : match.date || 'Date à confirmer';
    const timeText = d
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : match.time || 'Heure à confirmer';
    return `${dateText} | ${timeText}`;
  };

  return (
    <View style={styles.container}>
      {/* Phase Selector */}
      <View style={styles.phaseContainer}>
        {phases.map((phase) => (
          <TouchableOpacity
            key={phase}
            style={[styles.phaseButton, selectedPhase === phase && styles.phaseSelected]}
            onPress={() => setSelectedPhase(phase)}
          >
            <Text style={[styles.phaseText, selectedPhase === phase && styles.phaseTextSelected]}>
              {phase}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Prochain Match */}
      {selectedPhase === 'Prochain Match' && nextMatch ? (
        <View>
          <View style={styles.banner}>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Prochain Match</Text>
              <Text style={styles.bannerTeams}>{nextMatch.team1} vs {nextMatch.team2}</Text>
              <Text style={styles.bannerDate}>{formatDateTime(nextMatch)}</Text>
              <Text style={styles.countdown}>{countdown}</Text>
            </View>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
          </View>

          <View style={styles.expandedContainer}>
            <Text style={styles.expandedText}>🏟️ Lieu : {nextMatch.location || 'Non spécifié'}</Text>
            <Text style={styles.expandedText}>⚖️ Arbitre : {nextMatch.arbitre || 'À confirmer'}</Text>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => handlePressMatch(nextMatch)}
            >
              <Text style={styles.detailsButtonText}>Voir les détails du match</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : selectedPhase === 'Prochain Match' ? (
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
          Aucun match à venir pour le moment.
        </Text>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              Aucun match pour cette phase.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressMatch(item)}>
              <View style={styles.matchCard}>
                <View style={styles.matchRow}>
                  <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{item.team1}</Text>
                  <Text style={styles.vs}>vs</Text>
                  <Text style={styles.teamName}>{item.team2}</Text>
                  <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.teamLogo} />
                </View>
                <Text style={styles.matchInfo}>{formatDateTime(item)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  phaseContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    justifyContent: "center",
  },
  phaseButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
    marginTop: 10,
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  phaseSelected: { backgroundColor: "#1077a7ff" },
  phaseText: { fontSize: 13, color: "#333", fontWeight: "600" },
  phaseTextSelected: { color: "#fff" },
  banner: {
    backgroundColor: "#1077a7",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 1,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerLogo: { width: 120, height: 120, resizeMode: "contain" },
  bannerTextContainer: { alignItems: "center", flex: 1 },
  bannerTitle: { color: "#fff", fontSize: 16, marginTop: 20 },
  bannerTeams: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  bannerDate: { color: "#fff", fontSize: 14, marginTop: 20 },
  countdown: {
    color: "#ffe066",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  expandedContainer: {
    backgroundColor: "#f8fcffff",
    borderRadius: 25,
    padding: 25,
    marginTop: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  expandedText: { fontSize: 16, color: "#333", marginVertical: 10 },
  detailsButton: {
    marginTop: 10,
    backgroundColor: "#1077a7ff",
    paddingVertical: 10,
    padding: 25,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsButtonText: { color: "#fff", fontWeight: "600" },
  matchCard: {
    backgroundColor: "#f8fcffff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamLogo: { width: 45, height: 45, resizeMode: "contain" },
  teamName: { fontSize: 14, flex: 1, textAlign: "center" },
  vs: { fontWeight: "bold", color: "#333" },
  matchInfo: { textAlign: "center", color: "#777", marginTop: 5, fontSize: 12 },
});
