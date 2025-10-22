import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const phases = ['Prochain Match', 'Poules', 'Demi-Finales', 'Finale'];

const matches = [
  { id: '1', phase: 'Prochain Match', team1: 'Team A', team2: 'Team E', date: '2025-10-25', time: '07:45', location: 'Terrain Football Base Aérienne 101', referee: 'Mr. John Doe' },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `${i + 2}`,
    phase: 'Poules',
    team1: `Team ${String.fromCharCode(65 + (i % 4))}`,
    team2: `Team ${String.fromCharCode(69 + (i % 4))}`,
    date: '2025-10-21',
    time: '07:45',
  })),
  { id: '20', phase: 'Demi-Finales', team1: '1er Poule A', team2: '2e Poule B', date: '2025-10-28', time: '20:00' },
  { id: '21', phase: 'Demi-Finales', team1: '1er Poule B', team2: '2e Poule A', date: '2025-10-28', time: '22:00' },
  { id: '22', phase: 'Finale', team1: 'Vainqueur Demi 1', team2: 'Vainqueur Demi 2', date: '2025-11-01', time: '21:00' },
];

export default function FixturesScreen() {
  const [selectedPhase, setSelectedPhase] = useState('Prochain Match');
  const [countdown, setCountdown] = useState('');
  const navigation = useNavigation();

  const filteredMatches = matches.filter(m => m.phase === selectedPhase);
  const nextMatch = matches.find(m => m.phase === 'Prochain Match');

  // Countdown with seconds
  useEffect(() => {
    if (!nextMatch) return;
    const matchDateTime = new Date(`${nextMatch.date}T${nextMatch.time}:00`);

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
        {phases.map(phase => (
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

      {selectedPhase !== 'Prochain Match' && (
        <Text style={styles.infoText}>
          Cliquez sur une carte de match pour voir les détails (compositions des équipes, classement, événements, commentaires...).
        </Text>
      )}

      {/* Prochain Match Section */}
      {selectedPhase === 'Prochain Match' && nextMatch && (
        <View>
          <View style={styles.banner}>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Confrontation</Text>
              <Text style={styles.bannerTeams}>{nextMatch.team1} vs {nextMatch.team2}</Text>
              <Text style={styles.bannerDate}>{nextMatch.date} | {nextMatch.time}</Text>
              <Text style={styles.countdown}>{countdown}</Text>
            </View>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
          </View>

          {/* Permanent Expanded Info */}
          <View style={styles.expandedContainer}>
            <Text style={styles.expandedText}>🏟️ Lieu : {nextMatch.location}</Text>
            <Text style={styles.expandedText}>⚖️ Arbitre : {nextMatch.referee}</Text>
            <Text style={styles.expandedText}>📅 Date : {nextMatch.date}</Text>
            <Text style={styles.expandedText}>🕖 Heure : {nextMatch.time}</Text>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => handlePressMatch(nextMatch)}
            >
              <Text style={styles.detailsButtonText}>Voir les détails du match</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fixtures for other phases */}
      {selectedPhase !== 'Prochain Match' && (
        <FlatList
          data={filteredMatches}
          keyExtractor={item => item.id}
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
                <Text style={styles.matchInfo}>{item.date} | {item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  phaseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' },
  phaseButton: { backgroundColor: '#ddd', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, margin: 4, marginTop: 10 },
  phaseSelected: { backgroundColor: '#1077a7ff' },
  phaseText: { fontSize: 13, color: '#333', fontWeight: '600' },
  phaseTextSelected: { color: '#fff' },
  infoText: { textAlign: 'center', color: '#666', fontSize: 13, marginBottom: 15 },

  banner: {
    backgroundColor: '#1077a7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 1,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerLogo: { width: 120, height: 120, resizeMode: 'contain' },
  bannerTextContainer: { alignItems: 'center', flex: 1 },
  bannerTitle: { color: '#fff', fontSize: 16, marginTop: 20 },
  bannerTeams: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  bannerDate: { color: '#fff', fontSize: 14, marginTop: 20 },
  countdown: { color: '#ffe066', fontWeight: '600', fontSize: 14, marginTop: 20, marginBottom: 20 },

  expandedContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    marginTop: 20,
    elevation: 3,
    alignItems: 'center',
  },
  expandedText: { fontSize: 16, color: '#333', marginVertical: 10 },
  detailsButton: {
    marginTop: 10,
    backgroundColor: '#1077a7ff',
    paddingVertical: 10,
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
  },
  detailsButtonText: { color: '#fff', fontWeight: '600' },

  matchCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamLogo: { width: 45, height: 45, resizeMode: 'contain' },
  teamName: { fontSize: 14, flex: 1, textAlign: 'center' },
  vs: { fontWeight: 'bold', color: '#333' },
  matchInfo: { textAlign: 'center', color: '#777', marginTop: 5, fontSize: 12 },
});
