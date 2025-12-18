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
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : new Date(0),
        };
      });

      setNotifications(list);
    });

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

  return (
    <>
      <FlatList
        ref={listRef}
        onContentSizeChange={() =>
          listRef.current?.scrollToOffset({ offset: 0, animated: true })
        }
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => markAsReadAndNavigate(item)}
            style={{
              flexDirection: "row",
              padding: 15,
              marginHorizontal: 8,
              marginVertical: 5,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: "#ddd",
              elevation: 2,
              backgroundColor: item.read ? "#fff" : "#eef6ff",
            }}
          >
            <Ionicons
              name={item.icon || "notifications-outline"}
              size={28}
              color="#1077a7"
              style={{ marginRight: 12 }}
            />

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                {item.title}
              </Text>
              <Text>{item.body}</Text>

              {/* ---- Images / Videos in Notification ---- */}
              {item.media?.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {item.media.map((m, index) =>
                    m.type === "image" ? (
                      <Pressable
                        key={index}
                        onPress={(e) => {
                          e.stopPropagation();
                          setFullscreenMedia(m.url);
                        }}
                      >
                        <Image
                          source={{ uri: m.url }}
                          style={{
                            width: 90,
                            height: 90,
                            borderRadius: 10,
                            marginRight: 6,
                            marginBottom: 6,
                            borderWidth: 1,
                            borderColor: "#ccc",
                          }}
                        />
                      </Pressable>
                    ) : (
                      <View
                        key={index}
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 10,
                          marginRight: 6,
                          marginBottom: 6,
                          backgroundColor: "#ddd",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text>🎥</Text>
                      </View>
                    )
                  )}
                </View>
              )}

              <Text style={{ color: "gray", fontSize: 12, marginTop: 6 }}>
                {item.createdAt?.toLocaleString?.() || ""}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ---------- Fullscreen Image Modal ---------- */}
      <Modal
        visible={!!fullscreenMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenMedia(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setFullscreenMedia(null)}
        >
          <Image
            source={{ uri: fullscreenMedia }}
            style={{
              width: "90%",
              height: "80%",
              resizeMode: "contain",
            }}
          />
        </Pressable>
      </Modal>
    </>
  );
}
