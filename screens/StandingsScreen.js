import { Picker } from "@react-native-picker/picker";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function StandingsScreen() {
  const [activeTab, setActiveTab] = useState("Poules");
  const [selectedPoule, setSelectedPoule] = useState("Poule A");
  const [poules, setPoules] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [assists, setAssists] = useState([]);
  const [loading, setLoading] = useState(false);

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
    // fallback if team not found
    default: require("../assets/images/teams/TeamLogo.png"),
  };

  useEffect(() => {
    setLoading(true);

    const unsubPoules = onSnapshot(collection(db, "poules"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // sort each poule’s teams by points
      data.forEach((p) => {
        p.teams = p.teams?.sort((a, b) => (b.pts || 0) - (a.pts || 0)) || [];
      });
      setPoules(data);
    });

    const unsubScorers = onSnapshot(collection(db, "scorers"), (snapshot) => {
      const sorted = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.goals || 0) - (a.goals || 0));
      setScorers(sorted);
    });

    const unsubAssists = onSnapshot(collection(db, "assists"), (snapshot) => {
      const sorted = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.assists || 0) - (a.assists || 0));
      setAssists(sorted);
    });

    setLoading(false);

    return () => {
      unsubPoules();
      unsubScorers();
      unsubAssists();
    };
  }, []);

  const getGroup = (groupName) => {
    const poule = poules.find((p) => p.group === groupName);
    return poule ? poule.teams : [];
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 2 }]}>Equipe</Text>
      <Text style={styles.headerCell}>Pts</Text>
      <Text style={styles.headerCell}>MJ</Text>
      <Text style={styles.headerCell}>G</Text>
      <Text style={styles.headerCell}>N</Text>
      <Text style={styles.headerCell}>P</Text>
      <Text style={styles.headerCell}>BP</Text>
      <Text style={styles.headerCell}>BC</Text>
      <Text style={styles.headerCell}>DB</Text>
    </View>
  );

  const renderTeamRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index < 2 && styles.topTeam, // first two = qualified
      ]}
    >
      <View
        style={[styles.firstCell, { flex: 2, flexDirection: "row", alignItems: "center" }]}
      >
        <Image
          source={teamLogos[item.team] || teamLogos.default}
          style={styles.logo}
        />
        <Text numberOfLines={1} style={styles.teamName}>
          {item.team}
        </Text>
      </View>
      <Text style={styles.cell}>{item.pts}</Text>
      <Text style={styles.cell}>{item.mp}</Text>
      <Text style={styles.cell}>{item.w}</Text>
      <Text style={styles.cell}>{item.d}</Text>
      <Text style={styles.cell}>{item.l}</Text>
      <Text style={styles.cell}>{item.gf}</Text>
      <Text style={styles.cell}>{item.ga}</Text>
      <Text style={styles.cell}>{item.gd}</Text>
    </View>
  );

  const renderScorerRow = ({ item, index }) => (
    <View
      style={[styles.tableRow, index === 0 && styles.topHighlight]}
    >
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={[styles.teamName, { flex: 2 }]}> {item.player}</Text>
      <Image
        source={teamLogos[item.team] || teamLogos.default}
        style={styles.logo}
      />
      <Text style={[styles.teamName, { flex: 1 }]}>{item.team}</Text>
      <Text style={[styles.cell2, { flex: 1 }]}>{item.goals} ⚽</Text>
    </View>
  );

  const renderAssistRow = ({ item, index }) => (
    <View
      style={[styles.tableRow, index === 0 && styles.topHighlight]}
    >
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={[styles.teamName, { flex: 2 }]}> {item.player}</Text>
      <Image
        source={teamLogos[item.team] || teamLogos.default}
        style={styles.logoBracket}
      />
      <Text style={[styles.teamName, { flex: 1 }]}>{item.team}</Text>
      <Text style={[styles.cell2, { flex: 1 }]}>{item.assists} 🅰️</Text>
    </View>
  );

  // dummy bracket data
  const brackets = {
    quarts: [
      { team1: "1er Poule C", score1: 2, team2: "2e Poule B", score2: 1 },
      { team1: "1er Poule A", score1: 1, team2: "2e Poule D", score2: 2 },
      { team1: "1er Poule B", score1: 1, team2: "2e Poule C", score2: 0 },
      { team1: "1er Poule D", score1: 0, team2: "2e Poule A", score2: 2 },
    ],
    demis: [
      { team1: "Vainqueur QF 1", score1: 2, team2: "Vainqueur QF 2", score2: 1 },
      { team1: "Vainqueur QF 3", score1: 0, team2: "Vainqueur QF 4", score2: 3 },
    ],
    finale: [{ team1: "Vainqueur DF 1", score1: 1, team2: "Vainqueur DF 2", score2: 2 }],
  };

  const renderBracket = (round, matches) => (
    <View style={styles.roundContainer}>
      <Text style={styles.roundTitle}>{round}</Text>
      {matches.map((m, idx) => (
        <View key={idx} style={styles.matchBox}>
          <Image
            source={teamLogos[m.team1] || teamLogos.default}
            style={styles.logoBracket}
          />
          <Text style={styles.matchText}>
            {m.team1} 
          </Text>
          <Text style={styles.matchText}>
            {m.team2} 
          </Text>
          <Image
            source={teamLogos[m.team2] || teamLogos.default}
            style={styles.logoBracket}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {["Poules", "Phase Directe", "Buteurs", "Passeurs"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Poules */}
      {activeTab === "Poules" && (
        <>
          <Picker
            selectedValue={selectedPoule}
            style={[styles.dropdown, { color: "#1E293B" }]}
            dropdownIconColor="#1E293B"
            onValueChange={(itemValue) => setSelectedPoule(itemValue)}
          >
            <Picker.Item label="Poule A" value="Poule A" color="#1E293B" />
            <Picker.Item label="Poule B" value="Poule B" color="#1E293B" />
            <Picker.Item label="Poule C" value="Poule C" color="#1E293B" />
            <Picker.Item label="Poule D" value="Poule D" color="#1E293B" />
          </Picker>

          {renderHeader()}
          <FlatList
            data={getGroup(selectedPoule)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderTeamRow}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#475569" }}
              >
                Aucune équipe pour cette poule.
              </Text>
            }
          />

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#D1FAE5" }]} />
            <Text style={styles.legendText}>Équipes qualifiées pour la phase à Elimination Directe</Text>
            </View>
          </View>

          {["Poules"].includes(activeTab) && (
            <View style={styles.legendContainer}>
              {[
                { label: "Pts", text: " Points" },
                { label: "MJ", text: " Matchs Joués" },
                { label: "G", text: " Gagnés" },
                { label: "N", text: " Nuls" },
                { label: "P", text: " Perdus" },
                { label: "BP", text: " Buts Pour" },
                { label: "BC", text: " Buts Contre" },
                { label: "DB", text: " Différence de Buts" },
              ].map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendText}>{item.text}</Text>
                </View>
              ))}
            </View>
          )}

        </>
      )}

      {/* Buteurs */}
      {activeTab === "Buteurs" && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell2, { flex: 2 }]}>Joueur</Text>
            <Text style={[styles.headerCell2, { flex: 1 }]}>Équipe</Text>
            <Text style={[styles.headerCell2, { flex: 1 }]}>Buts</Text>
          </View>
          <FlatList
            data={scorers}
            keyExtractor={(item) => item.id}
            renderItem={renderScorerRow}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#D1FAE5" }]} />
            <Text style={styles.legendText}>Meilleur buteur du tournoi</Text>
            </View>
          </View>
        </>
      )}

      {/* Passeurs */}
      {activeTab === "Passeurs" && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell2, { flex: 2 }]}>Joueur</Text>
            <Text style={[styles.headerCell2, { flex: 1 }]}>Équipe</Text>
            <Text style={[styles.headerCell2, { flex: 1 }]}>Passes</Text>
          </View>
          <FlatList
            data={assists}
            keyExtractor={(item) => item.id}
            renderItem={renderAssistRow}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#D1FAE5" }]} />
            <Text style={styles.legendText}>Meilleur passeur du tournoi</Text>
            </View>
          </View>
        </>
      )}

      {/* Phase Directe */}
      {activeTab === "Phase Directe" && (
        <>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bracketScroll}
        >
          {renderBracket("Quarts de Finale", brackets.quarts)}
          {renderBracket("Demi-Finales", brackets.demis)}
          {renderBracket("Finale", brackets.finale)}
        </ScrollView>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
            <Text style={styles.legendLabel}>QF</Text>
            <Text style={styles.legendText}>Quart de Finale</Text>
            </View>

            <View style={styles.legendItem}>
            <Text style={styles.legendLabel}>DF</Text>
            <Text style={styles.legendText}>
              Demi-Finale
            </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15, marginBottom: 85 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    margin: 4,
    marginTop: 10,
  },
  activeTab: { backgroundColor: "#1077a7ff" },
  tabText: { color: "#333", fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#fff" },
  dropdown: {
    backgroundColor: "#f8fcffff",
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    borderColor: "#ddd",
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#1077a7ff",
    borderRadius: 8,
    marginBottom: 4,
    marginTop: 6,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginHorizontal: -20,
  },
  headerCell2: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#f8fcffff",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
    elevation: 1,
  },
  topTeam: { backgroundColor: "#D1FAE5" },
  maybeQualified: { backgroundColor: "#fae7d1ff" },
  topHighlight: { backgroundColor: "#D1FAE5" },
  cell: { flex: 1, textAlign: "center", color: "#1E293B", marginHorizontal: -9 },
  cell2: { flex: 1, textAlign: "center", color: "#1E293B" },
  firstCell: { flex: 1, textAlign: "center", color: "#1E293B", marginLeft: 3 },
  rank: {
    width: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1E293B",
  },
  logo: { width: 24, height: 24, marginHorizontal: 6 },
  logoBracket: { width: 24, height: 24, margin: 2 },
  teamName: { fontSize: 14, color: "#1E293B" },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 15,
    marginBottom: 15,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  legendText: { color: "#334155", fontSize: 13, marginRight: 10 },
  bracketScroll: { marginTop: 10 },
  roundContainer: { alignItems: "center", marginRight: 30 },
  roundTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#1077a7ff",
  },
  matchBox: {
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  matchText: { fontSize: 14, color: "#1E293B", margin: 1 },
  connectorLine: {
    width: 2,
    height: 10,
    backgroundColor: "#1077a7ff",
    marginVertical: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    elevation: 1,
    padding: 5,
    borderRadius: 6,
    margin: 4,
  },
  legendLabel: { fontWeight: "bold", marginRight: 4, color: "#1E293B" },
});
