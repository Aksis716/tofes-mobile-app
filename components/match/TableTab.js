// components/match/TableTab.js
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { db } from "../../firebaseConfig";

export default function TableTab({ match }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parse Firestore timestamp, JS Date, or string safely
  const parseDateTime = (dateValue, timeValue) => {
    if (!dateValue) return null;
    let dateObj = null;

    if (typeof dateValue === "object" && typeof dateValue.toDate === "function") {
      dateObj = dateValue.toDate();
    } else if (typeof dateValue === "object" && typeof dateValue.seconds === "number") {
      dateObj = new Date(dateValue.seconds * 1000);
    } else if (dateValue instanceof Date) {
      dateObj = dateValue;
    } else if (typeof dateValue === "string") {
      const timeStr =
        typeof timeValue === "string" && !timeValue.toLowerCase().includes("confirmer")
          ? timeValue
          : "00:00";
      const parts = dateValue.includes("-") ? dateValue.split("-") : dateValue.split("/");
      let year, month, day;
      if (parts.length >= 3 && parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts.length >= 3) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else return null;
      dateObj = new Date(`${year}-${month}-${day}T${timeStr}`);
    }
    return dateObj;
  };

  const formatFullDateTime = (dateValue, timeValue) => {
    const d = parseDateTime(dateValue, timeValue);
    if (!d) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getMatchStatus = (dateValue, timeValue, score1, score2) => {
    const now = new Date();
    const matchDate = parseDateTime(dateValue, timeValue);
    if (!matchDate) return "unknown";

    const matchEnd = new Date(matchDate.getTime() + 90 * 60 * 1000); // +90 minutes
    if (score1 !== null && score2 !== null) return "finished";
    if (now >= matchDate && now <= matchEnd) return "live";
    if (now < matchDate) return "upcoming";
    return "finished";
  };

  useEffect(() => {
    async function fetchTable() {
      try {
        setLoading(true);
        if (!match.phase) return;

        // ---- GROUP STAGES ----
        if (["Poule A", "Poule B", "Poule C"].includes(match.phase)) {
          const docNameMap = { "Poule A": "pouleA", "Poule B": "pouleB", "Poule C": "pouleC" };
          const pouleDoc = doc(db, "poules", docNameMap[match.phase]);
          const docSnap = await getDoc(pouleDoc);

          if (docSnap.exists()) {
            const pouleData = docSnap.data();
            setData(pouleData.teams || []);
          } else {
            console.warn("Poule document not found:", match.phase);
            setData([]);
          }

          // ---- KNOCKOUT PHASES ----
        } else if (["Quarts de Finale", "Demi-Finales", "Finale"].includes(match.phase)) {
          const q = query(
            collection(db, "fixtures"),
            where("phase", "==", match.phase),
            orderBy("date", "asc")
          );
          const snapshot = await getDocs(q);
          const fixtures = snapshot.docs.map((d) => ({
            id: d.id,
            team1: d.data().team1,
            team2: d.data().team2,
            score1: d.data().homeScore ?? null,
            score2: d.data().awayScore ?? null,
            date: d.data().date ?? null,
            time: d.data().time ?? null,
          }));
          setData(fixtures);
        }
      } catch (err) {
        console.error("Error fetching table:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTable();
  }, [match.phase]);

  if (loading) return <Text style={{ padding: 20 }}>Chargement…</Text>;

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* ---- GROUP STAGES ---- */}
      {["Poule A", "Poule B", "Poule C"].includes(match.phase) ? (
        <View  style={styles.card}>
          <Text style={styles.title}>Phase de Poules - {match.phase}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>#</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Équipe</Text>
            <Text style={styles.headerCell}>MJ</Text>
            <Text style={styles.headerCell}>G</Text>
            <Text style={styles.headerCell}>N</Text>
            <Text style={styles.headerCell}>P</Text>
            <Text style={styles.headerCell}>Pts</Text>
          </View>
          {data.map((team, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{i + 1}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{team.team}</Text>
              <Text style={styles.cell}>{team.mp}</Text>
              <Text style={styles.cell}>{team.w}</Text>
              <Text style={styles.cell}>{team.d}</Text>
              <Text style={styles.cell}>{team.l}</Text>
              <Text style={styles.cell}>{team.pts}</Text>
            </View>
          ))}
          <Text style={styles.legend}>
            Légende: MJ = Matchs joués, G = Gagnés, N = Nuls, P = Perdus, Pts = Points
          </Text>
        </View>
      ) : (
        // ---- KNOCKOUT PHASES ----
        <View style={styles.card}>
          <Text style={styles.title}>Élimination Directe - {match.phase}</Text>
          {data.map((f, i) => {
            const status = getMatchStatus(f.date, f.time, f.score1, f.score2);
            const formattedDate = formatFullDateTime(f.date, f.time);
            const statusStyle =
              status === "live"
                ? styles.live
                : status === "upcoming"
                ? styles.upcoming
                : styles.finished;

            return (
              <View key={f.id || i.toString()} style={[styles.fixtureCard, statusStyle]}>
                <Text style={styles.fixtureDate}>{formattedDate}</Text>

                <Text style={styles.fixtureText}>
                  {f.team1}{" "}
                  {f.score1 !== null ? f.score1 : ""} -{" "}
                  {f.score2 !== null ? f.score2 : ""} {f.team2}
                </Text>
                
                <Text style={styles.statusText}>
                  {status === "live"
                    ? "En direct 🔴"
                    : status === "upcoming"
                    ? "À venir 🕓"
                    : "Terminé ✅"}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8fcffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    marginTop: 5,
    textAlign: "center",
    color: "#1077a7ff",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    paddingVertical: 12,
    marginTop: 5,
    marginBottom: 4,
    marginHorizontal: 5,
    borderColor: "#CBD5E1",
    backgroundColor: "#1077a7ff",
    borderRadius: 8,
    elevation: 1,
  },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center", color: "#fff" },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 5,
    elevation: 1,
  },
  cell: { flex: 1, textAlign: "center" },
  legend: {
    fontSize: 12,
    color: "#666",
    marginTop: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  fixtureCard: {
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 14,
    elevation: 3,
    borderWidth: 0.5,
  },
  fixtureText: { fontWeight: "600", fontSize: 14, textAlign: "center", marginTop: 5 },
  fixtureDate: { fontSize: 12, color: "#333" },
  statusText: { marginTop: 4, fontSize: 13, fontWeight: "600", textAlign: "right" },

  // Status Colors
  upcoming: { backgroundColor: "#fff", borderColor: "#00acc1" },
  live: { backgroundColor: "#fff", borderColor: "#e53935" },
  finished: { backgroundColor: "#fff", borderColor: "#43a047" },
});
