import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { db } from '../firebaseConfig';

// Helper scaling functions
const scale = (size, width) => (width / 390) * size; // 390 = reference iPhone 12 width
const moderateScale = (size, width) => Math.round(scale(size, width));

export default function FixturesScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('Prochain Match');
  const [countdown, setCountdown] = useState('');
  const navigation = useNavigation();
  const { width, height, fontScale } = useWindowDimensions();

  const teamLogos = {
    AVIONS: require("../assets/images/teams/AVIONS.png"),
    EDA: require("../assets/images/teams/EDA.png"),
    ETAA: require("../assets/images/teams/ETAA.png"),
    CRDA: require("../assets/images/teams/CRDA.png"),
    BFA: require("../assets/images/teams/CFA.png"),
    MAF: require("../assets/images/teams/MAF.png"),
    CHASSE: require("../assets/images/teams/Chasse.png"),
    INFIRMERIE: require("../assets/images/teams/Infirmerie.png"),
    HELICOS: require("../assets/images/teams/Helicos.png"),
    EMAA: require("../assets/images/teams/EMAA.png"),
    FUAES: require("../assets/images/teams/FUAES.png"),
    DRONES: require("../assets/images/teams/Drones.png"),
    OSA: require("../assets/images/teams/OSA.png"),
    MGX: require("../assets/images/teams/MGX.png"),
    EMART: require("../assets/images/teams/EMART.png"),
    default: require("../assets/images/teams/TeamLogo.png"),
  };

  const phases = [
    'Prochain Match',
    'Poule A',
    'Poule B',
    'Poule C',
    'Poule D',
    'Quarts de Finale',
    'Demi-Finales',
    'Finale',
  ];

  useEffect(() => {
    const q = query(collection(db, 'fixtures'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        let dateObj = null;
        if (data?.date && typeof data.date === 'object' && data.date.seconds)
          dateObj = new Date(data.date.seconds * 1000);
        else if (data?.date) {
          const parsed = new Date(data.date);
          if (!isNaN(parsed.getTime())) dateObj = parsed;
        }
        return { id: doc.id, ...data, _dateObj: dateObj };
      });
      setFixtures(fetched);
    });
    return () => unsubscribe();
  }, []);

  const sortedFixtures = [...fixtures].sort((a, b) => {
    const dateA = a._dateObj || new Date(0);
    const dateB = b._dateObj || new Date(0);
    return dateA - dateB;
  });

  const now = new Date();
  const nextMatch = sortedFixtures.find((m) => m._dateObj && m._dateObj > now);

  const filteredMatches =
    selectedPhase === 'Prochain Match'
      ? sortedFixtures
      : sortedFixtures.filter((m) => m.phase === selectedPhase);

  useEffect(() => {
    if (!nextMatch || !nextMatch._dateObj) return;
    const matchDateTime = nextMatch._dateObj;
    const interval = setInterval(() => {
      const diff = matchDateTime - new Date();
      if (diff <= 0) {
        setCountdown('Match en cours !');
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}j ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextMatch]);

  const handlePressMatch = (match) => {
    const { _dateObj, ...serializableMatch } = match;
    navigation.navigate('Détails du Match', {
      matchId: match.id,
      match: serializableMatch,
    });
  };

  const formatDateTime = (match) => {
    const d = match._dateObj;
    const dateText = d ? d.toLocaleDateString() : match.date || 'Date à confirmer';
    const timeText = d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : match.time || 'Heure à confirmer';
    return `${dateText} | ${timeText}`;
  };

  return (
    <View style={[styles.container, { padding: moderateScale(15, width) }]}>
      {/* Phase Selector */}
      <View style={styles.phaseContainer}>
        {phases.map((phase) => (
          <TouchableOpacity
            key={phase}
            style={[
              styles.phaseButton,
              selectedPhase === phase && styles.phaseSelected,
              { paddingHorizontal: scale(12, width), paddingVertical: scale(6, width) },
            ]}
            onPress={() => setSelectedPhase(phase)}
          >
            <Text
              style={[
                styles.phaseText,
                selectedPhase === phase && styles.phaseTextSelected,
                { fontSize: moderateScale(13 * fontScale, width) },
              ]}
            >
              {phase}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Match */}
      {selectedPhase === 'Prochain Match' && nextMatch ? (
        <View>
          <View style={[styles.banner, { borderRadius: scale(25, width) }]}>
            <Image
              source={teamLogos[nextMatch.team1] || teamLogos.default}
              style={[styles.bannerLogo, { width: scale(90, width), height: scale(90, width) }]}
            />
            <View style={styles.bannerTextContainer}>
              <Text style={[styles.bannerTitle, { fontSize: moderateScale(14, width) }]}>Prochain Match</Text>
              <Text style={[styles.bannerTeams, { fontSize: moderateScale(14, width) }]}>
                {nextMatch.team1} vs {nextMatch.team2}
              </Text>
              <Text style={[styles.bannerDate, { fontSize: moderateScale(12, width) }]}>
                {formatDateTime(nextMatch)}
              </Text>
              <Text style={[styles.countdown, { fontSize: moderateScale(13, width) }]}>{countdown}</Text>
            </View>
            <Image
              source={teamLogos[nextMatch.team2] || teamLogos.default}
              style={[styles.bannerLogo, { width: scale(90, width), height: scale(90, width) }]}
            />
          </View>

          <View style={[styles.expandedContainer, { borderRadius: scale(25, width), padding: scale(20, width) }]}>
            <Text style={[styles.expandedText, { fontSize: moderateScale(14, width) }]}>⚔️ Phase : {nextMatch.phase || 'À confirmer'}</Text>
            <Text style={[styles.expandedText, { fontSize: moderateScale(14, width) }]}>👨‍🏫 Coach {nextMatch.team1 || '1'} : {nextMatch.coach1 || 'À confirmer'}</Text>
            <Text style={[styles.expandedText, { fontSize: moderateScale(14, width) }]}>👨‍🏫 Coach {nextMatch.team2 || '2'} : {nextMatch.coach2 || 'À confirmer'}</Text>
            <Text style={[styles.expandedText, { fontSize: moderateScale(14, width) }]}>⚖️ Arbitre : {nextMatch.arbitre || 'À confirmer'}</Text>
            <Text style={[styles.expandedText, { fontSize: moderateScale(14, width) }]}>⚖️ Commissaire : SLT Moustapha Abdoulkarim</Text>
            <Text style={[styles.expandedText, { fontSize: moderateScale(14, width) }]}>🏟️ Lieu : {nextMatch.location || 'Terrain Football Base Aérienne 101'}</Text>

            <TouchableOpacity
              style={[styles.detailsButton, { paddingVertical: scale(10, width), borderRadius: scale(25, width) }]}
              onPress={() => handlePressMatch(nextMatch)}
            >
              <Text style={[styles.detailsButtonText, { fontSize: moderateScale(14, width), paddingHorizontal: 10 }]}>
                Voir les détails du match
              </Text>
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
          contentContainerStyle={{ paddingBottom: scale(100, width) }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              Aucun match pour cette phase.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressMatch(item)}>
              <View style={[styles.matchCard, { borderRadius: scale(10, width) }]}>
                <View style={styles.matchRow}>
                  <Image source={teamLogos[item.team1] || teamLogos.default} style={[styles.teamLogo, { width: scale(45, width), height: scale(45, width) }]} />
                  <Text style={[styles.teamName, { fontSize: moderateScale(14, width) }]}>{item.team1}</Text>
                  <Text style={[styles.vs, { fontSize: moderateScale(14, width) }]}>{item.score1} - {item.score2}</Text>
                  <Text style={[styles.teamName, { fontSize: moderateScale(14, width) }]}>{item.team2}</Text>
                  <Image source={teamLogos[item.team2] || teamLogos.default} style={[styles.teamLogo, { width: scale(45, width), height: scale(45, width) }]} />
                </View>
                <Text style={[styles.matchInfo, { fontSize: moderateScale(12, width) }]}>{formatDateTime(item)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", marginBottom: 75 },
  phaseContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  phaseButton: {
    borderRadius: 20,
    margin: 4,
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  phaseSelected: { backgroundColor: "#1077a7ff" },
  phaseText: { color: "#333", fontWeight: "600" },
  phaseTextSelected: { color: "#fff" },
  banner: {
    backgroundColor: "#1077a7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerLogo: { resizeMode: "contain", marginHorizontal: 5 },
  bannerTextContainer: { alignItems: "center", flex: 1 },
  bannerTitle: { color: "#fff", marginTop: 15 },
  bannerTeams: { color: "#fff", fontWeight: "bold", marginTop: 20 },
  bannerDate: { color: "#fff", marginTop: 20 },
  countdown: { color: "#ffe066", fontWeight: "600", marginTop: 20, marginBottom: 10 },
  expandedContainer: {
    backgroundColor: "#f8fcffff",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  expandedText: { color: "#333", marginBottom: 15 },
  detailsButton: { backgroundColor: "#1077a7ff", alignItems: "center" },
  detailsButtonText: { color: "#fff", fontWeight: "600" },
  matchCard: {
    backgroundColor: "#f8fcffff",
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  matchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamLogo: { resizeMode: "contain" },
  teamName: { flex: 1, textAlign: "center", color: "#333" },
  vs: { fontWeight: "bold", color: "#333" },
  matchInfo: { textAlign: "center", color: "#777", marginTop: 5 },
});
