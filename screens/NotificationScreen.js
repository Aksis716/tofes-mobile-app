import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Query notifications, most recent first
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : data.createdAt
            ? new Date(data.createdAt)
            : new Date(0),
        };
      });

      setNotifications(list);
    });

    // Clean up when leaving the screen
    return () => unsubscribe();
  }, []);

  const markAsReadAndNavigate = async (notification) => {
    try {
      await updateDoc(doc(db, "notifications", notification.id), { read: true });
      if (notification.target) navigation.navigate(notification.target);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const listRef = useRef(null);

  return (
    <FlatList
      ref={listRef}
      onContentSizeChange={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => markAsReadAndNavigate(item)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            marginBottom: 5,
            marginTop: 5,
            marginHorizontal: 5,
            borderBottomWidth: 1,
            borderRadius: 15,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#ddd",
            backgroundColor: item.read ? "#fff" : "#eef6ff",
          }}
        >
          <Ionicons
            name={item.icon || "notifications-outline"}
            size={28}
            color="#1077a7"
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text style={{ color: "gray", fontSize: 12 }}>
              {item.createdAt instanceof Date
                ? item.createdAt.toLocaleString()
                : "Date not available"}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
