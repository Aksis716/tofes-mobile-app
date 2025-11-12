import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { db } from "../firebaseConfig";

const screenWidth = Dimensions.get("window").width;

export default function AdminDevicesScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "devices"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDevices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1077a7ff" />
        <Text>Chargement des appareils...</Text>
      </View>
    );
  }

  // 📊 Count devices by platform
  const platformCounts = devices.reduce((acc, device) => {
    const platform = device.platform || "unknown";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const totalDevices = devices.length;

  // 🟩 Pie chart data (platforms)
  const chartData = Object.keys(platformCounts).map((platform, i) => ({
    name: platform.toUpperCase(),
    count: platformCounts[platform],
    color:
      platform === "android"
        ? "#34a853"
        : platform === "ios"
        ? "#007aff"
        : platform === "web"
        ? "#ff9500"
        : "#999",
    legendFontColor: "#333",
    legendFontSize: 14,
  }));

  // 📆 Prepare daily growth data
  const dateCounts = {};
  devices.forEach((device) => {
    if (device.createdAt?.seconds) {
      const date = new Date(device.createdAt.seconds * 1000)
        .toISOString()
        .split("T")[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    }
  });

  const sortedDates = Object.keys(dateCounts).sort();
  const barData = {
    labels: sortedDates.slice(-7), // last 7 days
    datasets: [
      {
        data: sortedDates.slice(-7).map((d) => dateCounts[d]),
      },
    ],
  };

  const latestDevice = devices.sort(
    (a, b) => b.createdAt?.seconds - a.createdAt?.seconds
  )[0];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📱 Statistiques des appareils</Text>

      <View style={styles.statsBox}>
        <Text style={styles.statText}>
          Nombre total d’appareils :{" "}
          <Text style={styles.highlight}>{totalDevices}</Text>
        </Text>
        {latestDevice && (
          <Text style={styles.statText}>
            Dernier appareil ajouté :{" "}
            <Text style={styles.highlight}>
              {latestDevice.platform.toUpperCase()}
            </Text>
          </Text>
        )}
      </View>

      {/* 🥧 Pie Chart */}
      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Répartition par plateforme</Text>
          <PieChart
            data={chartData.map((d) => ({
              name: d.name,
              population: d.count,
              color: d.color,
              legendFontColor: d.legendFontColor,
              legendFontSize: d.legendFontSize,
            }))}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(16, 119, 167, ${opacity})`,
              labelColor: () => "#333",
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        <Text style={styles.noData}>
          Aucun appareil enregistré pour le moment.
        </Text>
      )}

      {/* 📈 Bar Chart for daily growth */}
      {sortedDates.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Croissance quotidienne</Text>
          <BarChart
            data={barData}
            width={screenWidth - 30}
            height={250}
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: "#f8fcffff",
              backgroundGradientFrom: "#f8fcffff",
              backgroundGradientTo: "#f8fcffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 119, 167, ${opacity})`,
              labelColor: () => "#333",
            }}
            style={styles.barChart}
          />
        </View>
      )}

      {/* 📋 Table of platforms */}
      <View style={styles.table}>
        <Text style={styles.tableTitle}>🧾 Détails par plateforme</Text>
        {Object.keys(platformCounts).map((p) => (
          <View key={p} style={styles.row}>
            <Text style={styles.cell}>{p.toUpperCase()}</Text>
            <Text style={styles.cell}>{platformCounts[p]} appareil(s)</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1077a7ff",
    marginBottom: 15,
  },
  statsBox: {
    backgroundColor: "#f8fcffff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  statText: { fontSize: 15, marginBottom: 5 },
  highlight: { fontWeight: "bold", color: "#1077a7ff" },
  noData: { textAlign: "center", color: "#777", marginTop: 20 },
  chartContainer: {
    backgroundColor: "#f8fcffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 15,
    marginBottom: 25,
    elevation: 2,
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#1077a7ff",
    marginBottom: 10,
  },
  table: {
    backgroundColor: "#f8fcffff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 40,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#1077a7ff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: { fontSize: 15 },
  barChart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
