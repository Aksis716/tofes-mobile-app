// screens/ResultsScreen.js
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const phases = ['Poule A', 'Poule B', 'Demi-Finales', 'Finale'];

const results = [
  { id: '1', phase: 'Poule A', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '2', phase: 'Poule A', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '3', phase: 'Poule A', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '4', phase: 'Poule A', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '5', phase: 'Poule A', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '6', phase: 'Poule A', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '7', phase: 'Poule B', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '8', phase: 'Poule B', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '9', phase: 'Poule B', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '10', phase: 'Poule B', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '11', phase: 'Poule B', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '12', phase: 'Poule B', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '13', phase: 'Demi-Finales', team1: 'Team C', team2: 'Team D', score: '0 - 3' },
  { id: '14', phase: 'Demi-Finales', team1: 'Team A', team2: 'Team B', score: '2 - 1' },
  { id: '15', phase: 'Finale', team1: 'Team C', team2: 'Team D', score: '0 - 3' },

];

export default function ResultsScreen() {
  const [selectedPhase, setSelectedPhase] = useState('Poule A');
  const filteredResults = results.filter(r => r.phase === selectedPhase);

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

      {/* Results List */}
      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.teamLogo} />
            <Text style={styles.teamName}>{item.team1}</Text>
            <Text style={styles.score}>{item.score}</Text>
            <Text style={styles.teamName}>{item.team2}</Text>
            <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.teamLogo} />
          </View>
        )}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  phaseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' },
  phaseButton: { backgroundColor: '#ddd', padding: 8, borderRadius: 20, margin: 4 },
  phaseSelected: { backgroundColor: '#1077a7ff' },
  phaseText: { fontSize: 13, color: '#333', fontWeight: "600" },
  phaseTextSelected: { color: '#fff' },
  resultCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 10, marginBottom: 8, borderRadius: 10 },
  teamLogo: { width: 50, height: 50, resizeMode: 'contain' },
  teamName: { flex: 1, textAlign: 'center', fontSize: 14 },
  score: { fontWeight: 'bold', fontSize: 16 },
});
