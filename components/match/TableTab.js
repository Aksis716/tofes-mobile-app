import { StyleSheet, Text, View } from "react-native";

export default function TableTab({ match }) {
  // Here you can fetch the league table from Firestore or state
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement</Text>
      {/* Example — Replace with real data */}
      <View style={styles.row}>
        <Text style={styles.cell}>{match.team1}</Text>
        <Text style={styles.cell}>1er</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>{match.team2}</Text>
        <Text style={styles.cell}>2ème</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  cell: { fontSize: 16 },
});
