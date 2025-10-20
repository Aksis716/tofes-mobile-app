//import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function MatchCard({ homeTeam, awayTeam, homeLogo, awayLogo, homeScore, awayScore, status }) {
  return (
    <View style={styles.card}>
      <View style={styles.team}>
        <Image source={{ uri: homeLogo }} style={styles.logo} />
        <Text style={styles.teamName}>{homeTeam}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{homeScore}</Text>
        <Text style={styles.dash}> - </Text>
        <Text style={styles.score}>{awayScore}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.team}>
        <Image source={{ uri: awayLogo }} style={styles.logo} />
        <Text style={styles.teamName}>{awayTeam}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  team: {
    alignItems: 'center',
    width: '30%',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 12,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dash: {
    fontSize: 18,
    marginHorizontal: 4,
  },
  status: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
});