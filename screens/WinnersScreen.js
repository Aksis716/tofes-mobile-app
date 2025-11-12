import { default as React, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers
const wp = percentage => (width * percentage) / 100;
const hp = percentage => (height * percentage) / 100;

const phases = ['1ère Edition', '2ème Edition', '3ème Edition'];

const winnersData = [
  {
    id: '1',
    phase: '3ème Edition',
    year: 'Janvier - Février 2024 ',
    team: 'EMAA',
    logo: require('../assets/images/teams/EMAA.png'),
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
    topScorer: 'SCH Abdoul Hayou Amadou (6 Buts)',
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

  const VirtualizedList = ({ children }) => (
    <FlatList
      data={[]}
      keyExtractor={() => 'key'}
      renderItem={null}
      ListHeaderComponent={<>{children}</>}
    />
  );

  return (
    <VirtualizedList>
      {/* Phase Selector */}
      <View style={styles.phaseContainer}>
        {phases.map(phase => (
          <TouchableOpacity
            key={phase}
            style={[
              styles.phaseButton,
              selectedPhase === phase && styles.phaseSelected,
            ]}
            onPress={() => setSelectedPhase(phase)}
          >
            <Text
              style={[
                styles.phaseText,
                selectedPhase === phase && styles.phaseTextSelected,
              ]}
            >
              {phase}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Display Selected Phase */}
      <FlatList
        data={winner}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            {/* Team Section */}
            <View style={styles.teamSection}>
              <Image source={item.logo} style={styles.teamLogo} />
            </View>

            <Text style={styles.teamName}>{item.team}</Text>

            {/* Info Sections */}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Période :</Text>
              <Text style={styles.infoValue}>{item.year}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Vice-Champion :</Text>
              <Text style={styles.infoValue}>{item.finalist}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Meilleur Joueur :</Text>
              <Text style={styles.infoValue}>{item.bestPlayer}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Meilleur Buteur :</Text>
              <Text style={styles.infoValue}>{item.topScorer}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Plus Beau But :</Text>
              <Text style={styles.infoValue}>{item.puskas}</Text>
            </View>

            {/* Ceremony Images */}
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

            {/* Modal for full-screen image */}
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
                  onPress={() => setSelectedImage(null)}
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
  phaseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: hp(1),
  },
  phaseButton: {
    backgroundColor: '#f8fcffff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: 20,
    margin: wp(2),
  },
  phaseSelected: {
    backgroundColor: '#1077a7ff',
  },
  phaseText: {
    fontSize: wp(3),
    color: '#333',
    fontWeight: '600',
  },
  phaseTextSelected: {
    color: '#fff',
  },
  cardContainer: {
    backgroundColor: '#f8fcffff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#ddd',
    marginHorizontal: wp(3),
    marginVertical: hp(1),
    paddingVertical: hp(2),
    alignItems: 'center',
    elevation: 4,
  },
  teamSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  teamLogo: {
    width: wp(40),
    height: wp(40),
    resizeMode: 'contain',
    marginVertical: hp(1),
  },
  teamName: {
    fontSize: wp(6),
    fontWeight: '700',
    color: '#1077a7ff',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(85),
    marginVertical: hp(0.5),
  },
  infoLabel: {
    fontSize: wp(3.8),
    color: '#555',
  },
  infoValue: {
    fontSize: wp(3.8),
    color: '#1077a7ff',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  carousel: {
    marginTop: hp(1.5),
  },
  ceremonyImage: {
    width: wp(70),
    height: hp(25),
    borderRadius: 10,
    resizeMode: 'cover',
    marginHorizontal: wp(2),
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    resizeMode: 'contain',
  },
});
