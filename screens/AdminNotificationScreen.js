import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";

export default function AdminNotificationScreen() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const allTokens = [];
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.expoToken) {
          allTokens.push(data.expoToken);
        }
      });
      setTokens(allTokens);
    };
    fetchTokens();
  }, []);

  const sendNotification = async () => {
    if (!title || !message) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs !");
    }

    for (const token of tokens) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          sound: "default",
          title: title,
          body: message,
        }),
      });
    }

    Alert.alert("✅ Succès", "Notification envoyée à tous les utilisateurs !");
    setTitle("");
    setMessage("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
          color: "#1077a7ff",
        }}
      >
        Envoyer une notification 📢
      </Text>

      <TextInput
        placeholder="Titre"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Message"
        style={[styles.input, { height: 100 }]}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={sendNotification}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#1077a7ff",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
};
