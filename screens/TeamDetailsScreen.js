import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function TeamDetailsScreen({ route }) {
  const { team } = route.params;

  // ✅ Extended list of 12 players
  const players = [
    { id: '1', name: 'John Doe', number: 9, position: 'Forward' },
    { id: '2', name: 'Ali Hassan', number: 10, position: 'Midfielder' },
    { id: '3', name: 'David K.', number: 1, position: 'Goalkeeper' },
    { id: '4', name: 'Leo Mensah', number: 5, position: 'Defender' },
    { id: '5', name: 'Samuel T.', number: 7, position: 'Winger' },
    { id: '6', name: 'Karim B.', number: 4, position: 'Defender' },
    { id: '7', name: 'Amadou S.', number: 11, position: 'Forward' },
    { id: '8', name: 'Joseph M.', number: 6, position: 'Midfielder' },
    { id: '9', name: 'Peter L.', number: 2, position: 'Defender' },
    { id: '10', name: 'Youssef R.', number: 8, position: 'Midfielder' },
    { id: '11', name: 'Marc A.', number: 3, position: 'Defender' },
    { id: '12', name: 'Ibrahim D.', number: 12, position: 'Winger' },
  ];

  const renderPlayer = ({ item }) => (
    <View style={styles.playerRow}>
      <Icon name="person-outline" size={22} color="#1077a7ff" />
      <Text style={styles.playerNumber}>#{item.number}</Text>
      <Text style={styles.playerName}>{item.name}</Text>
      <Text style={styles.playerPosition}>{item.position}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={team.logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.teamName}>{team.name}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.info}>🏙️ Nom Complet: {team.city}</Text>
        <Text style={styles.info}>👔 Coach: {team.coach}</Text>
        <Text style={styles.info}>⚽ Nombre de joueurs: {players.length}</Text>
        <Text style={styles.info}>⭐ Tournois remportés: 3</Text>
      </View>

      <Text style={styles.playersTitle}>👟 Joueurs Enregistrés</Text>
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.playersList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 15,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1077a7ff',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  playersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1077a7ff',
  },
  playersList: {
    paddingBottom: 40, // so last item isn't cut off
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  playerNumber: {
    fontWeight: 'bold',
    color: '#1077a7ff',
    marginHorizontal: 8,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  playerPosition: {
    fontSize: 14,
    color: 'gray',
  },
});
