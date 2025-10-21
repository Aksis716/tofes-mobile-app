import React, { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const groupA = [
  { id: "1", team: "Eagles", pts: 25, mp: 10, w: 8, d: 1, l: 1, gf: 20, ga: 8, gd: 12 },
  { id: "2", team: "Lions", pts: 21, mp: 10, w: 7, d: 0, l: 3, gf: 18, ga: 12, gd: 6 },
  { id: "3", team: "Wolves", pts: 17, mp: 10, w: 5, d: 2, l: 3, gf: 14, ga: 13, gd: 1 },
  { id: "4", team: "Tigers", pts: 13, mp: 10, w: 4, d: 1, l: 5, gf: 12, ga: 16, gd: -4 },
];

const groupB = [
  { id: "1", team: "Falcons", pts: 24, mp: 10, w: 7, d: 3, l: 0, gf: 19, ga: 7, gd: 12 },
  { id: "2", team: "Panthers", pts: 19, mp: 10, w: 6, d: 1, l: 3, gf: 15, ga: 11, gd: 4 },
  { id: "3", team: "Sharks", pts: 14, mp: 10, w: 4, d: 2, l: 4, gf: 12, ga: 14, gd: -2 },
  { id: "4", team: "Bulls", pts: 9, mp: 10, w: 3, d: 0, l: 7, gf: 10, ga: 18, gd: -8 },
];

const topScorers = [
  { id: "1", player: "John Doe", team: "Eagles", goals: 12 },
  { id: "2", player: "Ali Karim", team: "Falcons", goals: 10 },
  { id: "3", player: "Luis Gomez", team: "Lions", goals: 9 },
];

const topAssists = [
  { id: "1", player: "Mohamed Salah", team: "Lions", assists: 9 },
  { id: "2", player: "Carlos Silva", team: "Falcons", assists: 7 },
  { id: "3", player: "Mehmet Kaya", team: "Panthers", assists: 6 },
];

export default function StandingsScreen() {
  const [activeTab, setActiveTab] = useState("Poule A");

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
      ]}
    >
      <View style={[styles.cell, { flex: 2, flexDirection: "row", alignItems: "center" }]}>
        <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.logo} />
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
      <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.logo} />
      <Text style={[styles.teamName, { flex: 1 }]}>{item.team}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.goals} ⚽</Text>
    </View>
  );

  const renderAssistRow = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={[styles.teamName, { flex: 2 }]}>  {item.player}</Text>
      <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.logo} />
      <Text style={[styles.teamName, { flex: 1 }]}>{item.team}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.assists} 🅰️</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {["Poule A", "Poule B", "Meilleurs Buteurs", "Meilleurs Passeurs"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === "Poule A" && (
        <>
          {renderHeader()}
          <FlatList data={groupA} keyExtractor={(item) => item.id} renderItem={renderTeamRow} />
        </>
      )}
      {activeTab === "Poule B" && (
        <>
          {renderHeader()}
          <FlatList data={groupB} keyExtractor={(item) => item.id} renderItem={renderTeamRow} />
        </>
      )}
      {activeTab === "Meilleurs Buteurs" && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Joueur</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Equipe</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Buts</Text>
          </View>
          <FlatList data={topScorers} keyExtractor={(item) => item.id} renderItem={renderScorerRow} />
        </>
      )}
      {activeTab === "Meilleurs Passeurs" && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Joueur</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Equipe</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Passes</Text>
          </View>
          <FlatList data={topAssists} keyExtractor={(item) => item.id} renderItem={renderAssistRow} />
        </>
      )}

      {/* Legend */}
      {(activeTab === "Poule A" || activeTab === "Poule B") && (
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
  tabs: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 8, backgroundColor: "#ddd", borderRadius: 20 , margin: 4},
  activeTab: { backgroundColor: "#1077a7ff" },
  tabText: { color: "#333", fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#fff" },

  tableHeader: { flexDirection: "row", paddingVertical: 20, borderBottomWidth: 2, borderColor: "#CBD5E1", backgroundColor: "#1077a7ff", borderRadius: 8, marginBottom: 4 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center", color: "#fff" },

  tableRow: { flexDirection: "row", paddingVertical: 15, borderBottomWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff", alignItems: "center", borderRadius: 8, marginVertical: 2 },
  topTeam: { backgroundColor: "#D1FAE5" },
  secondTeam: { backgroundColor: "#FEF9C3" },

  cell: { flex: 1, textAlign: "center", color: "#1E293B" },
  rank: { width: 20, textAlign: "center", fontWeight: "bold", color: "#1E293B" },
  logo: { width: 24, height: 24, marginHorizontal: 6 },
  teamName: { fontSize: 14, color: "#1E293B" },

  legendContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#dddddd85", padding: 5, borderRadius: 6, margin: 4 },
  legendLabel: { fontWeight: "bold", marginRight: 4, color: "#1E293B" },
  legendText: { color: "#334155" },
});
