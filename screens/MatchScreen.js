import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Image, StyleSheet, Text, View } from "react-native";


import CommentsTab from "../components/match/CommentsTab";
import EventsTab from "../components/match/EventsTab";
import LineupsTab from "../components/match/LineupsTab";
import TableTab from "../components/match/TableTab";

const Tab = createMaterialTopTabNavigator();

export default function MatchScreen({ route }) {

  //  const route = useRoute();
  const { match } = route.params; // match object passed from fixtures/results

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.team}>
          <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.logo} />
          <Text style={styles.teamName}>{match.team1}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{match.homeScore ?? "-"}</Text>
          <Text style={styles.vs}> - </Text>
          <Text style={styles.score}>{match.awayScore ?? "-"}</Text>
          <Text style={styles.time}>
            {match.status === "LIVE" ? "🟢 " : ""}{match.time}
          </Text>
        </View>

        <View style={styles.team}>
          <Image source={require('../assets/images/teams/TeamLogo.png')} style={styles.logo} />
          <Text style={styles.teamName}>{match.team2}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#1077a7",
            tabBarInactiveTintColor: "#777",
            tabBarIndicatorStyle: { backgroundColor: "#1077a7" },
            tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
          }}
        >
          <Tab.Screen name="Table">
            {() => <TableTab match={match} />}
          </Tab.Screen>
          <Tab.Screen name="Lineups">
            {() => <LineupsTab match={match} />}
          </Tab.Screen>
          <Tab.Screen name="Events">
            {() => <EventsTab match={match} />}
          </Tab.Screen>
          <Tab.Screen name="Comments">
            {() => <CommentsTab match={match} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  team: { alignItems: "center", flex: 1 },
  teamName: { fontWeight: "bold", textAlign: "center", marginTop: 5 },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  scoreContainer: { alignItems: "center", flex: 1 },
  score: { fontSize: 28, fontWeight: "bold" },
  vs: { fontSize: 22, fontWeight: "600" },
  time: { fontSize: 13, color: "#555", marginTop: 5 },
  tabs: { flex: 1 },
});
