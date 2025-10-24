import { Picker } from "@react-native-picker/picker";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { db } from "../firebaseConfig";

export default function AdminNotificationScreen() {
  const [type, setType] = useState("fixture");
  const [message, setMessage] = useState("");

  const typeData = {
    fixture: { title: "📅 Update Match", icon: "calendar-outline", target: "Matchs" },
    schedule: { title: "🕒 Update Programme", icon: "time-outline", target: "Programme" },
    info: { title: "ℹ️ Information", icon: "information-circle-outline", target: "Accueil" },
  };

  const sendNotification = async () => {
    try {
      const { title, icon, target } = typeData[type];
      const tokensSnapshot = await getDocs(collection(db, "devices"));
      const tokens = tokensSnapshot.docs.map(doc => doc.data().expoToken);

      // Save in database (for users to fetch)
      await addDoc(collection(db, "notifications"), {
        title,
        body: message,
        icon,
        type,
        target,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Send notification to all tokens
      await Promise.all(
        tokens.map(token =>
          fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: token,
              title,
              body: message,
              data: { screen: target },
            }),
          })
        )
      );

      Alert.alert("✅ Succès", "Notification envoyée à tous les utilisateurs!");
      setMessage("");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Erreur", "Notification non envoyée!");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: 10,
          color: "#1077a7ff",
          textAlign: "center",
        }}
      >
        Envoyer Notification
      </Text>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: "#1077a7ff",
        }}
      >
        Type:
      </Text>
      <Picker
        selectedValue={type}
        onValueChange={setType}
        style={{ marginVertical: 10 }}
      >
        <Picker.Item label="📅 Update Match" value="fixture" />
        <Picker.Item label="🕒 Update Programme" value="schedule" />
        <Picker.Item label="ℹ️ Information" value="info" />
      </Picker>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: "#1077a7ff",
        }}
      >
        Message:
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          textAlignVertical: "top",
          height: 120,
          marginVertical: 30,
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="Ecrivez votre message..."
        multiline
        numberOfLines={5}
      />

      <Button
        title="Envoyer"
        color="#1077a7ff"
        onPress={sendNotification}
      />
    </View>
  );
}
