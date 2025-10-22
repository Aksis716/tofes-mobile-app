import { StyleSheet, Text, View } from "react-native";

export default function LineupsTab({ match }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compositions</Text>
      {/* Here you will display players on the field */}
      <View style={styles.pitch}>
        
      </View>
      <Text style={styles.benchTitle}>Remplaçants</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  pitch: {
    width: "100%",
    height: 300,
    backgroundColor: "#1077a720",
    borderRadius: 10,
    marginBottom: 15,
  },
  player: {
    position: "absolute",
    backgroundColor: "#1077a7",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  playerText: { color: "#fff", fontWeight: "bold" },
  benchTitle: { fontWeight: "bold", marginTop: 10, marginBottom: 5 },
});
