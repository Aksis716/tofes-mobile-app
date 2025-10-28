import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";

export default function StandingsScreen() {
  const [activeTab, setActiveTab] = useState("Poule A");
  const [poules, setPoules] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [assists, setAssists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const unsubPoules = onSnapshot(collection(db, "poules"), (snapshot) => {
      setPoules(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
        index === 0 && styles.topTeam,
        index === 1 && styles.topTeam,
        index === 2 && styles.top3,
      ]}
    >
      <View style={[styles.cell, { flex: 2, flexDirection: "row", alignItems: "center" }]}>
        <Image source={require("../assets/images/teams/TeamLogo.png")} style={styles.logo} />
        <Text numberOfLines={1} style={styles.teamName}>{item.team}</Text>
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
    <View style={styles.tableRow}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={[styles.teamName, { flex: 2 }]}>  {item.player}</Text>
      <Image source={require("../assets/images/teams/TeamLogo.png")} style={styles.logo} />
      <Text style={[styles.teamName, { flex: 1 }]}>{item.team}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.goals} ⚽</Text>
    </View>
  );

  const renderAssistRow = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={[styles.teamName, { flex: 2 }]}>  {item.player}</Text>
      <Image source={require("../assets/images/teams/TeamLogo.png")} style={styles.logo} />
      <Text style={[styles.teamName, { flex: 1 }]}>{item.team}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.assists} 🅰️</Text>
    </View>
  );

  const getGroup = (groupName) => {
    const poule = poules.find((p) => p.group === groupName);
    return poule ? poule.teams : [];
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {["Poule A", "Poule B", "Poule C", "Buteurs", "Passeurs"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {["Poule A", "Poule B", "Poule C"].includes(activeTab) && (
        <>
          {renderHeader()}
          <FlatList
            data={getGroup(activeTab)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderTeamRow}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20, color: "#475569" }}>
                Aucune équipe pour cette poule.
              </Text>
            }
          />
        </>
      )}

      {activeTab === "Buteurs" && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Joueur</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Equipe</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Buts</Text>
          </View>
          <FlatList
            data={scorers}
            keyExtractor={(item) => item.id}
            renderItem={renderScorerRow}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20, color: "#475569" }}>
                Aucun buteur pour le moment.
              </Text>
            }
          />
        </>
      )}

      {activeTab === "Passeurs" && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Joueur</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Equipe</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Passes</Text>
          </View>
          <FlatList
            data={assists}
            keyExtractor={(item) => item.id}
            renderItem={renderAssistRow}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20, color: "#475569" }}>
                Aucun passeur pour le moment.
              </Text>
            }
          />
        </>
      )}

      {/* Legend */}
      {["Poule A", "Poule B", "Poule C"].includes(activeTab) && (
        <View style={styles.legendContainer}>
          {[
            { label: "Pts", text: "  Points" },
            { label: "MJ", text: "  Matchs Joués" },
            { label: "G", text: "  Gagnés" },
            { label: "N", text: "  Nuls" },
            { label: "P", text: "  Perdus" },
            { label: "BP", text: "  Buts Pour" },
            { label: "BC", text: "  Buts Contre" },
            { label: "DB", text: "  Différence de Buts" },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15 },
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
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 20,
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
  top3: { backgroundColor: "#fae7d1ff" },
  cell: { flex: 1, textAlign: "center", color: "#1E293B" },
  rank: { width: 20, textAlign: "center", fontWeight: "bold", color: "#1E293B" },
  logo: { width: 24, height: 24, marginHorizontal: 6 },
  teamName: { fontSize: 14, color: "#1E293B" },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    justifyContent: "center",
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
  legendText: { color: "#334155" },
});
