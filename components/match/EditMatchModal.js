import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../firebaseConfig";

export default function EditMatchModal({ visible, onClose, match, onUpdate }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore ?? "");
  const [date, setDate] = useState(match.date ?? "");
  const [time, setTime] = useState(match.time ?? "");

  const handleSave = async () => {
    try {
      const matchRef = doc(db, "fixtures", match.id);
      await updateDoc(matchRef, {
        homeScore: homeScore === "" ? null : Number(homeScore),
        awayScore: awayScore === "" ? null : Number(awayScore),
        date: date,
        time: time,
      });
      onUpdate({ ...match, homeScore, awayScore, date, time });
      onClose();
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Éditer le match</Text>

          <TextInput
            style={styles.input}
            placeholder="Score équipe 1"
            value={homeScore.toString()}
            keyboardType="numeric"
            onChangeText={setHomeScore}
          />
          <TextInput
            style={styles.input}
            placeholder="Score équipe 2"
            value={awayScore.toString()}
            keyboardType="numeric"
            onChangeText={setAwayScore}
          />
          <TextInput style={styles.input} placeholder="Date (yyyy-mm-dd)" value={date} onChangeText={setDate} />
          <TextInput style={styles.input} placeholder="Time (HH:MM)" value={time} onChangeText={setTime} />

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#1077a7" }]} onPress={handleSave}>
              <Text style={{ color: "#fff" }}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#aaa" }]} onPress={onClose}>
              <Text style={{ color: "#fff" }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  container: { width: "90%", backgroundColor: "#fff", borderRadius: 15, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
  btn: { flex: 1, marginHorizontal: 5, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
});
