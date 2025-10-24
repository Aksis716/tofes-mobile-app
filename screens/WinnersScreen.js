import { default as React, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const phases = ['1ère Edition', '2ème Edition', '3ème Edition'];

const winnersData = [
  {
    id: '1',
    phase: '3ème Edition',
    year: 'Janvier - Février 2024 ',
    team: 'EMAA',
    logo: require('../assets/images/teams/TeamLogo.png'),
    finalist: 'Avions',
    puskas: 'LTN Hassane Zapré',
    bestPlayer: 'LTN Hassane Zapré',
    topScorer: 'LTN Hassane Zapré (6 Buts)',
    ceremonyImages: [
      require('../assets/images/palmares/Edition3A.jpeg'),
      require('../assets/images/palmares/Edition3B.jpeg'),
      require('../assets/images/palmares/Edition3C.jpeg'),
    ],
  },
  {
    id: '2',
    phase: '2ème Edition',
    year: 'Décembre 2022 - Janvier 2023',
    team: 'Avions',
    logo: require('../assets/images/teams/AVIONS.png'),
    finalist: 'EMART',
    puskas: 'ASP Souradji',
    bestPlayer: 'SCH Abdoul Hayou Amadou',
    topScorer: '   SCH Abdoul Hayou Amadou (6 Buts)',
    ceremonyImages: [
      require('../assets/images/palmares/Edition2A.jpeg'),
      require('../assets/images/palmares/Edition2B.jpeg'),
      require('../assets/images/palmares/Edition2C.jpeg'),
    ],
  },
  {
    id: '3',
    phase: '1ère Edition',
    year: 'Décembre 2021 - Janvier 2022',
    team: 'Avions',
    logo: require('../assets/images/teams/AVIONS.png'),
    finalist: 'MGX',
    puskas: 'SGT Magagi',
    bestPlayer: '2CL Aminou Amadou',
    topScorer: 'LTN Abdoul Karim Yaou (5 Buts)',
    ceremonyImages: [
      require('../assets/images/palmares/Edition1A.jpeg'),
      require('../assets/images/palmares/Edition1B.jpeg'),
      require('../assets/images/palmares/Edition1C.jpeg'),
    ],
  },
];

export default function PreviousWinnersScreen() {
    const [selectedPhase, setSelectedPhase] = useState('3ème Edition');
    const winner = winnersData.filter(r => r.phase === selectedPhase);

    const [selectedImage, setSelectedImage] = useState(null);

    const VirtualizedList = ({ children }) => {
      return (
        <FlatList
          data={[]}
          keyExtractor={() => "key"}
          renderItem={null}
          ListHeaderComponent={<>{children}</>}
        />
      );
    };

  return (
    <VirtualizedList>

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

      {/* Display the selected phase */}

      <FlatList
        data={winner}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.container2}>

            <View style={styles.teamSection}>
            <Image source={item.logo} style={styles.teamLogo} />
            </View>

            <View style={styles.teamSection2}>
            <Text style={styles.teamName}>{item.team}</Text>
            </View>

            <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Période :</Text>
            <Text style={styles.infoValue}>{item.year}</Text>
            </View>

            <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Vice-Champion :</Text>
            <Text style={styles.infoValue}>{item.finalist}</Text>
            </View>

            <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Meilleur Joueur :</Text>
            <Text style={styles.infoValue}>{item.bestPlayer}</Text>
            </View>

            <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Meilleur Buteur :</Text>
            <Text style={styles.infoValue}>{item.topScorer}</Text>
            </View>

            <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Plus Beau But :</Text>
            <Text style={styles.infoValue}>{item.puskas}</Text>
            </View>

            <FlatList
            data={item.ceremonyImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(img, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedImage(item)}>
                <Image source={item} style={styles.ceremonyImage} />
              </TouchableOpacity>
            )}
            style={styles.carousel}
            />

            {/* 🔍 Modal for full-screen image */}
            <Modal
              visible={!!selectedImage}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setSelectedImage(null)}
            >
              <View style={styles.modalBackground}>
                <TouchableOpacity
                  style={styles.fullImageContainer}
                  activeOpacity={1}
                  onPress={() => setSelectedImage(null)} // close on tap
                >
                  <Image source={selectedImage} style={styles.fullImage} />
                </TouchableOpacity>
              </View>
            </Modal>

          </View>
        )}
      />

    </VirtualizedList>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  container2: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  year: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1077a7ff',
    textAlign: 'center',
    marginBottom: 10,
  },
  teamSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamSection2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  teamLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginTop: 20,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1077a7ff',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingHorizontal: 20,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#1077a7ff',
    fontWeight: '600',
  },
  carousel: {
    marginTop: 15,
  },
  ceremonyImage: {
    width: width * 0.7,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
    modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
    resizeMode: "contain",
  },
  phaseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, marginTop: 10, justifyContent: 'center' },
  phaseButton: { backgroundColor: '#ddd', padding: 8, borderRadius: 20, margin: 10 },
  phaseSelected: { backgroundColor: '#1077a7ff' },
  phaseText: { fontSize: 12, color: '#333', fontWeight: "600" },
  phaseTextSelected: { color: '#fff' },
});
