// components/match/TableTab.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

export default function TableTab({ match }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  const scale = width / 390; // iPhone 12 baseline

  const teamLogos = {
    AVIONS: require("../../assets/images/teams/AVIONS.png"),
    EDA: require("../../assets/images/teams/EDA.png"),
    ETAA: require("../../assets/images/teams/ETAA.png"),
    CRDA: require("../../assets/images/teams/CRDA.png"),
    BFA: require("../../assets/images/teams/CFA.png"),
    MAF: require("../../assets/images/teams/MAF.png"),
    CHASSE: require("../../assets/images/teams/Chasse.png"),
    INFIRMERIE: require("../../assets/images/teams/Infirmerie.png"),
    HELICOS: require("../../assets/images/teams/Helicos.png"),
    EMAA: require("../../assets/images/teams/EMAA.png"),
    FUAES: require("../../assets/images/teams/FUAES.png"),
    DRONES: require("../../assets/images/teams/Drones.png"),
    OSA: require("../../assets/images/teams/OSA.png"),
    MGX: require("../../assets/images/teams/MGX.png"),
    EMART: require("../../assets/images/teams/EMART.png"),
    default: require("../../assets/images/teams/TeamLogo.png"),
  };

  // ---------- DATE HELPERS ----------
  const parseDateTime = (dateValue, timeValue) => {
    if (!dateValue) return null;

    if (typeof dateValue?.toDate === "function") return dateValue.toDate();
    if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
    if (dateValue instanceof Date) return dateValue;

    if (typeof dateValue === "string") {
      const time =
        typeof timeValue === "string" && !timeValue.toLowerCase().includes("confirmer")
          ? timeValue
          : "00:00";
      const parts = dateValue.includes("-")
        ? dateValue.split("-")
        : dateValue.split("/");
      if (parts.length < 3) return null;

      const [d, m, y] =
        parts[0].length === 4 ? [parts[2], parts[1], parts[0]] : parts;
      return new Date(`${y}-${m}-${d}T${time}`);
    }
    return null;
  };

  const formatFullDateTime = (d, t) => {
    const date = parseDateTime(d, t);
    if (!date) return "";
    return `${date.toLocaleDateString()} ${date
      .toLocaleTimeString()
      .slice(0, 5)}`;
  };

  const getMatchStatus = (dateValue, timeValue, score1, score2) => {
    const now = new Date();
    const matchDate = parseDateTime(dateValue, timeValue);
    if (!matchDate) return "unknown";

    const matchEnd = new Date(matchDate.getTime() + 90 * 60 * 1000);

    // 🕓 Match not started yet
    if (now < matchDate) return "upcoming";

    // 🔴 Match in progress
    if (now >= matchDate && now <= matchEnd) return "live";

    // ✅ Match finished (time-based, not score-based)
    if (now > matchEnd) return "finished";

    return "unknown";
  };

  // ---------- FETCH ----------
  useEffect(() => {
    async function fetchTable() {
      try {
        setLoading(true);
        if (!match?.phase) return;

        if (["Poule A", "Poule B", "Poule C", "Poule D"].includes(match.phase)) {
          const map = {
            "Poule A": "pouleA",
            "Poule B": "pouleB",
            "Poule C": "pouleC",
            "Poule D": "pouleD",
          };
          const snap = await getDoc(doc(db, "poules", map[match.phase]));
          setData(snap.exists() ? snap.data().teams || [] : []);
        } else {
          const q = query(
            collection(db, "fixtures"),
            where("phase", "==", match.phase),
            orderBy("date", "asc")
          );
          const snap = await getDocs(q);
          setData(
            snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }))
          );
        }
      } catch (e) {
        console.error(e);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTable();
  }, [match.phase]);

  if (loading) return <Text style={{ padding: 20 }}>Chargement…</Text>;

  // ---------- GROUP TABLE ----------
  const renderGroup = () => (
    <View style={styles.card}>
      <Text style={[styles.title, { fontSize: 16 * scale }]}>
        Phase de Poules – {match.phase}
      </Text>

      <View style={styles.header}>
        {["#", "Équipe", "MJ", "G", "N", "P", "Pts"].map((h, i) => (
          <Text
            key={i}
            style={[
              styles.headerCell,
              { flex: i === 1 ? 2.2 : 1, fontSize: 12 * scale },
            ]}
          >
            {h}
          </Text>
        ))}
      </View>

      {data.map((team, i) => {
        const isQualified = i < 2;
        return (
          <View
            key={i}
            style={[
              styles.row,
              isQualified && styles.qualifiedRow,
            ]}
          >
            <Text style={styles.cell}>{i + 1}</Text>

            <View style={[styles.teamCell, { flex: 2.2 }]}>
              <Image
                source={teamLogos[team.team] || teamLogos.default}
                style={{ width: 18 * scale, height: 18 * scale, marginRight: 6 }}
                resizeMode="contain"
              />
              <Text style={styles.teamText}>{team.team}</Text>
            </View>

            <Text style={styles.cell}>{team.mp}</Text>
            <Text style={styles.cell}>{team.w}</Text>
            <Text style={styles.cell}>{team.d}</Text>
            <Text style={styles.cell}>{team.l}</Text>
            <Text style={[styles.cell, styles.points]}>{team.pts}</Text>
          </View>
        );
      })}

      <Text style={[styles.legend, { fontSize: 11 * scale }]}>
        Les 2 premières équipes sont qualifiées
      </Text>
      <Text style={[styles.legend, { fontSize: 11 * scale }]}> Légende: MJ = Matchs joués, G = Gagnés, N = Nuls, P = Perdus, Pts = Points </Text>
    </View>
  );

  // ---------- KNOCKOUT ----------
  const renderKnockout = () => (
    <View style={styles.card}>
      <Text style={[styles.title, { fontSize: 16 * scale }]}>
        Élimination Directe – {match.phase}
      </Text>

      {data.map((f, i) => {
        const status = getMatchStatus(f.date, f.time, f.homeScore, f.awayScore);
        return (
          <View key={f.id || i} style={styles.fixture}>
            <Text style={styles.fixtureDate}>
              {formatFullDateTime(f.date, f.time)}
            </Text>
            <Text style={styles.fixtureText}>
              {f.team1} {f.homeScore ?? ""} – {f.awayScore ?? ""} {f.team2}
            </Text>
            <Text style={styles.status}>
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
  );

  return (
    <View style={{ padding: 10 }}>
      {["Poule A", "Poule B", "Poule C", "Poule D"].includes(match.phase)
        ? renderGroup()
        : renderKnockout()}
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 3,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    color: "#1077a7",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#1077a7",
    borderRadius: 8,
    paddingVertical: 8,
  },
  headerCell: {
    flex: 1,
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  qualifiedRow: {
    backgroundColor: "#e8fff1ff",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  teamCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamText: {
    fontWeight: "600",
  },
  points: {
    fontWeight: "800",
  },
  legend: {
    marginTop: 14,
    textAlign: "center",
    color: "#444",
    fontWeight: "600",
  },
  fixture: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    marginVertical: 6,
  },
  fixtureText: {
    fontWeight: "600",
    textAlign: "center",
  },
  fixtureDate: {
    fontSize: 12,
    color: "#444",
  },
  status: {
    textAlign: "right",
    marginTop: 4,
    fontWeight: "600",
  },
});
