import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function FixturesScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('Prochain Match');
  const [countdown, setCountdown] = useState('');
  const navigation = useNavigation();

  const phases = ['Prochain Match', 'Poule A', 'Poule B', 'Poule C', 'Quarts de Finale', 'Demi-Finales', 'Finale'];

  // Helper: Parse date safely
  const parseDateTime = (dateStr, timeStr) => {
    // Handles both "2025-10-24" and "24/10/2025"
    let parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    if (parts[0].length === 4) {
      // yyyy-mm-dd
      return new Date(`${dateStr}T${timeStr || '00:00'}`);
    } else {
      // dd/mm/yyyy
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}T${timeStr || '00:00'}`);
    }
  };

  // Helper: Format date for display
  const formatDate = (dateStr) => {
    let parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    if (parts[0].length === 4) {
      // yyyy-mm-dd → dd/mm/yyyy
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      // already dd/mm/yyyy
      return dateStr;
    }
  };

  // Fetch fixtures from Firestore
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fixtures'));
        const fixtureData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFixtures(fixtureData);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      }
    };
    fetchFixtures();
  }, []);

  // Sort fixtures by date/time
  const sortedFixtures = [...fixtures].sort((a, b) => {
    const dateA = parseDateTime(a.date, a.time);
    const dateB = parseDateTime(b.date, b.time);
    return dateA - dateB;
  });

  // Determine next match (closest upcoming)
  const now = new Date();
  const nextMatch = sortedFixtures.find((m) => parseDateTime(m.date, m.time) > now);

  // Filtered matches for selected phase
  const filteredMatches =
    selectedPhase === 'Prochain Match'
      ? sortedFixtures
      : sortedFixtures.filter((m) => m.phase === selectedPhase);

  // Countdown for next match
  useEffect(() => {
    if (!nextMatch) return;

    const matchDateTime = parseDateTime(nextMatch.date, nextMatch.time);
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

  const handlePressMatch = (match) => {
    navigation.navigate('MatchScreen', { match });
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

      {/* PROCHAIN MATCH SECTION */}
      {selectedPhase === 'Prochain Match' && nextMatch ? (
        <View>
          <View style={styles.banner}>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Prochain Match</Text>
              <Text style={styles.bannerTeams}>{nextMatch.team1} vs {nextMatch.team2}</Text>
              <Text style={styles.bannerDate}>
                {formatDate(nextMatch.date)} | {nextMatch.time}
              </Text>
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
                <Text style={styles.matchInfo}>
                  {formatDate(item.date)} | {item.time}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// Styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  phaseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' },
  phaseButton: { backgroundColor: '#ddd', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, margin: 4, marginTop: 10 },
  phaseSelected: { backgroundColor: '#1077a7ff' },
  phaseText: { fontSize: 13, color: '#333', fontWeight: '600' },
  phaseTextSelected: { color: '#fff' },
  infoText: { textAlign: 'center', color: '#666', fontSize: 13, marginBottom: 15 },
  banner: { backgroundColor: '#1077a7', flexDirection: 'row', justifyContent: 'space-between', padding: 1, borderRadius: 25, alignItems: 'center', marginBottom: 15, marginTop: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  bannerLogo: { width: 120, height: 120, resizeMode: 'contain' },
  bannerTextContainer: { alignItems: 'center', flex: 1 },
  bannerTitle: { color: '#fff', fontSize: 16, marginTop: 20 },
  bannerTeams: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  bannerDate: { color: '#fff', fontSize: 14, marginTop: 20 },
  countdown: { color: '#ffe066', fontWeight: '600', fontSize: 14, marginTop: 20, marginBottom: 20 },
  expandedContainer: { backgroundColor: '#fff', borderRadius: 25, padding: 25, marginTop: 20, elevation: 3, alignItems: 'center' },
  expandedText: { fontSize: 16, color: '#333', marginVertical: 10 },
  detailsButton: { marginTop: 10, backgroundColor: '#1077a7ff', paddingVertical: 10, padding: 25, borderRadius: 25, alignItems: 'center' },
  detailsButtonText: { color: '#fff', fontWeight: '600' },
  matchCard: { backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamLogo: { width: 45, height: 45, resizeMode: 'contain' },
  teamName: { fontSize: 14, flex: 1, textAlign: 'center' },
  vs: { fontWeight: 'bold', color: '#333' },
  matchInfo: { textAlign: 'center', color: '#777', marginTop: 5, fontSize: 12 },
});
