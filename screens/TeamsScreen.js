import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TeamsScreen() {
  const navigation = useNavigation();

  const teams = [
    { id: '1', name: 'Avions', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Dakar', coach: 'John Smith' },
    { id: '2', name: 'CFA', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Accra', coach: 'Michael Adams' },
    { id: '3', name: 'EMAA', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Lagos', coach: 'David Johnson' },
    { id: '4', name: 'EMART', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Nairobi', coach: 'James Brown' },
    { id: '5', name: 'MGX', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Dakar', coach: 'John Smith' },
    { id: '6', name: 'Hélicos', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Accra', coach: 'Michael Adams' },
    { id: '7', name: 'CRDA', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Lagos', coach: 'David Johnson' },
    { id: '8', name: 'Drones', logo: require('../assets/images/teams/TeamLogo.png'), city: 'Nairobi', coach: 'James Brown' },
    // ➕ Add more teams as needed
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => navigation.navigate('TeamDetails', { team: item })}
    >
      <Image source={item.logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.teamName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.text}>Les huit (08) équipes retenues pour la compétition sont indiquées ci-dessous. Elles s’affronteront
         dans un système de poules avant de passer aux matchs de qualification directe. Les détails sur chaque équipe peuvent être
         obtenus en cliquant sur son logo. </Text>

      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // grid layout
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  text: {
    fontSize: 15,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1077a7ff',
  },
  list: {
    paddingHorizontal: 10,
  },
  teamCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 8,
    padding: 10,
    borderRadius: 12,
    elevation: 2, // shadow on Android
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1077a7ff',
  },
});
