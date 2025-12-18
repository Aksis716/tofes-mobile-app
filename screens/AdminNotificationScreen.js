import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
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
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function AdminNotificationScreen() {
  const [type, setType] = useState("fixture");
  const [titleInput, setTitleInput] = useState(""); // NEW TITLE FIELD
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [media, setMedia] = useState([]);

  const storage = getStorage();

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

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });
    return () => unsubscribe();
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets.map((item) => ({
        uri: item.uri,
        type: item.type,
      }));
      setMedia((prev) => [...prev, ...selected]);
    }
  };

  const uploadFile = async (file) => {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const filename = `notifications/${Date.now()}-${Math.random()}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return { url: downloadURL, type: file.type };
  };

  const sendNotification = async () => {
    if (!titleInput.trim()) {
      return Alert.alert("Erreur", "Veuillez ajouter un titre.");
    }

    if (!message.trim() && media.length === 0) {
      return Alert.alert(
        "Erreur",
        "Veuillez écrire un message ou ajouter une image/vidéo."
      );
    }

    try {
      const { icon, target } = typeData[type];

      let uploadedMedia = [];
      if (media.length > 0) {
        uploadedMedia = await Promise.all(media.map((m) => uploadFile(m)));
      }

      const tokensSnapshot = await getDocs(collection(db, "devices"));
      const tokens = tokensSnapshot.docs.map((doc) => doc.data().expoToken);

      await addDoc(collection(db, "notifications"), {
        title: titleInput.trim(),
        body: message,
        icon,
        type,
        target,
        createdAt: serverTimestamp(),
        media: uploadedMedia,
      });

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
              title: titleInput.trim(),
              body: message || "📸 Nouvelle image !",
              data: { screen: target },
            }),
          })
        )
      );

      Alert.alert("✅ Succès", "Notification envoyée !");
      setMessage("");
      setTitleInput("");
      setMedia([]);

    } catch (error) {
      console.error(error);
      Alert.alert("❌ Erreur", "Impossible d'envoyer la notification.");
    }
  };

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
              Alert.alert("✅ Supprimée", "Notification supprimée !");
            } catch (error) {
              console.error(error);
              Alert.alert("❌ Erreur", "Impossible de supprimer !");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ padding: 10, backgroundColor: "#f9fafb", flex: 1 }}>
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

      {/* Type */}
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1077a7ff" }}>
        Type:
      </Text>
      <Picker selectedValue={type} onValueChange={setType} style={{ marginVertical: 5 }}>
        <Picker.Item label="⚽️ Match" value="fixture" />
        <Picker.Item label="📅 Calendrier" value="schedule" />
        <Picker.Item label="ℹ️ Information" value="info" />
      </Picker>

      {/* NEW TITLE FIELD */}
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1077a7ff" }}>
        Titre:
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginTop: 5,
          backgroundColor: "#fff",
        }}
        value={titleInput}
        onChangeText={setTitleInput}
        placeholder="Titre de la notification..."
      />

      {/* Message */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: "#1077a7ff",
          marginTop: 10,
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
          height: 120,
          marginVertical: 10,
          backgroundColor: "#fff",
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="Écrivez votre message..."
        multiline
      />

      {/* Media preview */}
      {media.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
          {media.map((m, index) => (
            <Image
              key={index}
              source={{ uri: m.uri }}
              style={{
                width: 70,
                height: 70,
                borderRadius: 8,
                margin: 5,
                borderWidth: 1,
                borderColor: "#ccc",
              }}
            />
          ))}
        </View>
      )}

      <Button title="Ajouter images / vidéos" color="#1077a7ff" onPress={pickMedia} />

      <View style={{ marginVertical: 10 }}>
        <Button title="Envoyer" color="#1077a7ff" onPress={sendNotification} />
      </View>

      {/* List */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginTop: 10,
          marginBottom: 10,
          color: "#1077a7ff",
          textAlign: "center",
        }}
      >
        Notifications envoyées
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 10,
              marginVertical: 6,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#1077a7ff" }}>{item.title}</Text>
            <Text style={{ color: "#555" }}>{item.body}</Text>

            {item.media?.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                {item.media.map((m, i) =>
                  m.type === "image" ? (
                    <Image
                      key={i}
                      source={{ uri: m.url }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    />
                  ) : (
                    <Text key={i} style={{ color: "#444" }}>
                      🎥 Vidéo
                    </Text>
                  )
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={() => deleteNotification(item.id)}
              style={{ position: "absolute", right: 10, top: 10 }}
            >
              <Ionicons name="trash-outline" size={24} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
