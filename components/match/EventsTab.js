import { FlatList, StyleSheet, Text, View } from "react-native";

export default function EventsTab({ match }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={match.events}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.event}>
            <Text style={styles.minute}>{item.minute}'</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  event: { flexDirection: "row", marginVertical: 5 },
  minute: { fontWeight: "bold", width: 40 },
  desc: { flex: 1 },
});
