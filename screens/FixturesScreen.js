// screens/FixturesScreen.js
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const phases = ['Prochain Match', 'Phase de Poules', 'Demi-Finales', 'Finale'];

const matches = [
  { id: '1', phase: 'Prochain Match', team1: 'Team A', team2: 'Team E', date: '2025-10-20', time: '07:45' },
  { id: '2', phase: 'Phase de Poules', team1: 'Team A', team2: 'Team E', date: '2025-10-21', time: '07:45' },
  { id: '4', phase: 'Phase de Poules', team1: 'Team B', team2: 'Team F', date: '2025-10-21', time: '07:45' },
  { id: '5', phase: 'Phase de Poules', team1: 'Team B', team2: 'Team F', date: '2025-10-21', time: '07:45' },
  { id: '6', phase: 'Phase de Poules', team1: 'Team B', team2: 'Team F', date: '2025-10-21', time: '07:45' },
  { id: '7', phase: 'Phase de Poules', team1: 'Team C', team2: 'Team G', date: '2025-10-21', time: '07:45' },
  { id: '8', phase: 'Phase de Poules', team1: 'Team C', team2: 'Team G', date: '2025-10-21', time: '07:45' },
  { id: '9', phase: 'Phase de Poules', team1: 'Team C', team2: 'Team G', date: '2025-10-21', time: '07:45' },
  { id: '10', phase: 'Phase de Poules', team1: 'Team D', team2: 'Team H', date: '2025-10-21', time: '07:45' },
  { id: '11', phase: 'Phase de Poules', team1: 'Team D', team2: 'Team H', date: '2025-10-21', time: '07:45' },
  { id: '12', phase: 'Phase de Poules', team1: 'Team D', team2: 'Team H', date: '2025-10-21', time: '07:45' },
  { id: '13', phase: 'Phase de Poules', team1: 'Team E', team2: 'Team I', date: '2025-10-21', time: '07:45' },
  { id: '14', phase: 'Demi-Finales', team1: '1er Poule A', team2: '2e Poule B', date: '2025-10-21', time: '07:45' },
  { id: '15', phase: 'Demi-Finales', team1: '1er Poule B', team2: '2e Poule A', date: '2025-10-21', time: '07:45' },
  { id: '16', phase: 'Finale', team1: 'Vainqueur Demi 1', team2: 'Vainqueur Demi 2', date: '2025-10-21', time: '07:45' },
];

export default function FixturesScreen() {
  const [selectedPhase, setSelectedPhase] = useState('Prochain Match');

  const filteredMatches = matches.filter(m => m.phase === selectedPhase);

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

      {/* Upcoming Match Banner */}
      <View style={styles.banner}>
        <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerText}>Prochaine Confrontation</Text>
          <Text style={styles.bannerTeams}>Team A vs Team B</Text>
          <Text style={styles.bannerDate}>2025-10-20 | 07:45</Text>
        </View>
        <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.bannerLogo} />
      </View>

      {/* Fixture List */}
      <FlatList
        data={filteredMatches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
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
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  phaseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' },
  phaseButton: { backgroundColor: '#ddd', padding: 8, borderRadius: 20, margin: 4 },
  phaseSelected: { backgroundColor: '#1077a7ff' },
  phaseText: { fontSize: 13, color: '#333', fontWeight: "600" },
  phaseTextSelected: { color: '#fff' },
  banner: {
    backgroundColor: '#1077a7ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  bannerLogo: { width: 80, height: 80, resizeMode: 'contain' },
  bannerTextContainer: { alignItems: 'center' },
  bannerText: { color: '#fff', fontSize: 14 },
  bannerTeams: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerDate: { color: '#fff', fontSize: 12 },
  matchCard: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 10 },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamLogo: { width: 50, height: 50, resizeMode: 'contain' },
  teamName: { fontSize: 14, flex: 1, textAlign: 'center' },
  vs: { fontWeight: 'bold', color: '#333' },
  matchInfo: { textAlign: 'center', color: '#777', marginTop: 5, fontSize: 12 },
});
