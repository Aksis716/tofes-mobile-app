// screens/NotificationScreen.js
import { FlatList, StyleSheet, Text, View } from "react-native";

const notifications = [
  {
    id: "1",
    title: "⚽ Début du match",
    content: "Le match entre Lions et Eagles vient de commencer !",
    time: "Il y a 2 min",
  },
  {
    id: "2",
    title: "🥅 But marqué !",
    content: "L’équipe Lions vient de marquer un but.",
    time: "Il y a 10 min",
  },
  {
    id: "3",
    title: "🏁 Fin du match",
    content: "Score final: Lions 2 - 1 Eagles",
    time: "Il y a 20 min",
  },
];

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8f9fa" },
  notification: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#1077a7",
  },
  title: { fontWeight: "bold", fontSize: 16, color: "#1077a7" },
  content: { color: "#333", marginTop: 5 },
  time: { fontSize: 12, color: "#6c757d", marginTop: 5 },
});
