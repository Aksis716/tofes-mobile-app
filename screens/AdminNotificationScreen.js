import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function AdminNotificationScreen() {
  const [type, setType] = useState("fixture");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  const typeData = {
    fixture: {
      title: "⚽️ Match",
      icon: "football-outline",
      target: "Matchs",
    },
    schedule: {
      title: "📅 Calendrier",
      icon: "calendar-outline",
      target: "Programme",
    },
    info: {
      title: "ℹ️ Information",
      icon: "information-circle-outline",
      target: "Accueil",
    },
  };

  // Real-time fetch of notifications
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });

    // Clean up listener when leaving screen
    return () => unsubscribe();
  }, []);

  // Send new notification
  const sendNotification = async () => {
    if (!message.trim()) {
      return Alert.alert("Erreur", "Veuillez écrire un message avant d’envoyer !");
    }

    try {
      const { title, icon, target } = typeData[type];
      const tokensSnapshot = await getDocs(collection(db, "devices"));
      const tokens = tokensSnapshot.docs.map((doc) => doc.data().expoToken);

      // Save notification in Firestore
      await addDoc(collection(db, "notifications"), {
        title,
        body: message,
        icon,
        type,
        target,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Send notification to all devices via Expo
      await Promise.all(
        tokens.map((token) =>
          fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              Accept: "application/json",
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

      Alert.alert("✅ Succès", "Notification envoyée à tous les utilisateurs !");
      setMessage("");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Erreur", "Notification non envoyée !");
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    Alert.alert(
      "Supprimer la notification",
      "Voulez-vous vraiment supprimer cette notification ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "notifications", id));
              Alert.alert("✅ Supprimée", "La notification a été supprimée !");
            } catch (error) {
              console.error("Erreur suppression:", error);
              Alert.alert("❌ Erreur", "Impossible de supprimer la notification !");
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={{
        padding: 20,
        borderRadius: 25,
        borderColor: "#ddd",
        elevation: 2,
        margin: 15,
        backgroundColor: "#f9fafb",
        flex: 1,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: 20,
          color: "#1077a7ff",
          textAlign: "center",
        }}
      >
        Envoyer Notification
      </Text>

      {/* --- Type --- */}
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1077a7ff" }}>
        Type:
      </Text>
      <Picker
        selectedValue={type}
        onValueChange={setType}
        style={{ marginVertical: 10 }}
      >
        <Picker.Item label="⚽️ Match" value="fixture" />
        <Picker.Item label="📅 Calendrier" value="schedule" />
        <Picker.Item label="ℹ️ Information" value="info" />
      </Picker>

      {/* --- Message --- */}
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1077a7ff" }}>
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
          backgroundColor: "#fff",
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="Écrivez votre message..."
        multiline
        numberOfLines={5}
      />

      <Button title="Envoyer" color="#1077a7ff" onPress={sendNotification} />

      {/* --- Notifications list --- */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginTop: 30,
          marginBottom: 10,
          color: "#1077a7ff",
          textAlign: "center",
        }}
      >
        Notifications envoyées
      </Text>

      {notifications.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: "#666",
            marginTop: 20,
            fontStyle: "italic",
          }}
        >
          Aucune notification pour le moment.
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: 12,
                marginVertical: 6,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold", color: "#1077a7ff" }}>
                  {item.title}
                </Text>
                <Text style={{ color: "#555" }}>{item.body}</Text>
                <Text style={{ fontSize: 12, color: "#999" }}>
                  Type : {item.type}
                </Text>
              </View>

              <TouchableOpacity onPress={() => deleteNotification(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
