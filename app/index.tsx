import * as React from 'react';
import { useEffect, useRef, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

import { EventSubscription } from "expo-modules-core";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as Updates from 'expo-updates';
import { Alert, Platform } from "react-native";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import FixturesScreen from '../screens/FixturesScreen';
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import StandingsScreen from '../screens/StandingsScreen';

import AdminFixturesScreen from '../screens/AdminFixturesScreen';
import AdminTablesScreen from '../screens/AdminTablesScreen';
import MatchScreen from '../screens/MatchScreen';
import ParametersScreen from '../screens/ParametersScreen';
import RulesScreen from '../screens/RulesScreen';
import TeamDetailsScreen from '../screens/TeamDetailsScreen';
import TeamsScreen from '../screens/TeamsScreen';
import WinnersScreen from '../screens/WinnersScreen';

import AdminNotificationScreen from "../screens/AdminNotificationScreen";
import AuthScreen from '../screens/AuthScreen';
import NotificationScreen from "../screens/NotificationScreen";
import ProfileScreen from "../screens/ProfileScreen";

import CustomDrawer from '../components/CustomDrawer';
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


async function registerDeviceInDatabase(token: any) {
  if (!token) return;

  try {
    const q = query(collection(db, "devices"), where("expoToken", "==", token));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log("ℹ️ Device already registered.");
      return;
    }

    await addDoc(collection(db, "devices"), {
      expoToken: token,
      platform: Platform.OS,
      createdAt: new Date().toISOString(),
    });
    console.log("✅ New device registered in Firestore.");
  } catch (error) {
    console.error("❌ Failed to register device:", error);
  }
}


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Programme') iconName = 'calendar-outline';
          else if (route.name === 'Matchs') iconName = 'football-outline';
          else if (route.name === 'Classement') iconName = 'stats-chart-outline';
          else iconName = 'ribbon-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1077a7ff',
        tabBarInactiveTintColor: 'gray',
      })}
    >

      <Tab.Screen
          name="Tournoi"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
      />
      <Tab.Screen
          name="Programme"
          component={ScheduleScreen}
          options={{
            headerShown: false,
          }}
      />
      <Tab.Screen
          name="Matchs"
          component={FixturesScreen}
          options={{
            headerShown: false,
          }}
      />
      <Tab.Screen
          name="Classement"
          component={StandingsScreen}
          options={{
            headerShown: false,
          }}
      />
    </Tab.Navigator>
  );
}

function TeamsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TeamsMain"
        component={TeamsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeamDetails"
        component={TeamDetailsScreen}
        options={{
          title: "Détails Equipe",
          headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 17,
        },
        }}
      />
    </Stack.Navigator>
  );
}

export default function Index() {

const [unreadCount, setUnreadCount] = useState(0);

const notificationListener = useRef<EventSubscription | null>(null);
const responseListener = useRef<EventSubscription | null>(null);

useEffect(() => {
  async function setupNotifications() {
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        console.log("❌ No Expo token received.");
        return;
      }

      console.log("✅ Got Expo token:", token);

      // 1️⃣ Register in devices collection (global list)
      await registerDeviceInDatabase(token);

      // 2️⃣ If logged in, also attach to user profile
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { expoToken: token });
        console.log("✅ Token linked to user:", user.uid);
      }

      // 3️⃣ Listeners for foreground and background notifications
      const receivedSub = Notifications.addNotificationReceivedListener(n =>
        console.log("📬 Notification received:", n)
      );
      const responseSub = Notifications.addNotificationResponseReceivedListener(r =>
        console.log("📬 Notification opened:", r)
      );

      return () => {
        receivedSub.remove();
        responseSub.remove();
      };
    } catch (err) {
      console.error("🔥 Error in setupNotifications:", err);
    }
  }

  setupNotifications();
}, []);


useEffect(() => {
  async function checkForUpdates() {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  }
  checkForUpdates();
}, []);

useEffect(() => {
  // live count of unread notifications
  const q = collection(db, "notifications"); // or query for read==false if you store read flag
  // if you store `read` flag, use: query(collection(db,"notifications"), where("read","==",false))
  const unsub = onSnapshot(q, snapshot => {
    // count unread (if you have read flag)
    const unread = snapshot.docs.filter(d => !d.data().read).length;
    setUnreadCount(unread);
  }, err => console.error(err));

  return () => unsub();
}, []);




  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
    Alert.alert(
      "Succès 🎉",
      "Déconnexion Réussie!",
      [{ text: "OK" }]
    );
  };

const TopRightIcons = ({ navigation }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
    {/* Notifications */}
    <TouchableOpacity onPress={() => navigation.navigate("NotificationsPage")}>
      <View>
        <Ionicons name="notifications-outline" size={28} color="#fff" style={{ marginRight: 15 }} />
        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              right: 10,
              top: -6,
              backgroundColor: "red",
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 3,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>

    {/* User icon */}
    <TouchableOpacity
      onPress={() => {
        if (user) {
          navigation.navigate("Profile");
        } else {
          navigation.navigate("Auth");
        }
      }}
    >
      <Ionicons name="person-circle-outline" size={35} color="#fff" />
    </TouchableOpacity>
  </View>
);

  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: "slide",
        headerShown: true,
        drawerActiveTintColor: "#1077a7ff", // active item color
        drawerInactiveTintColor: "gray",
        drawerStyle: {
          backgroundColor: "#fff",
          width: 250,
        },
        headerStyle: {
          backgroundColor: "#1077a7ff", // 🎨 Header background color
        },
        headerTintColor: "#fff", // 🖋 Color of text and icons
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
        },
        headerTitleAlign: "center",
        headerRight: () => <TopRightIcons navigation={navigation} />,
      })}
    >
      <Drawer.Screen
        name="Accueil"
        component={BottomTabs}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Equipes Participantes"
        component={TeamsStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Règlement du Tournoi"
        component={RulesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Palmarès 🏆"
        component={WinnersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Paramètres"
        component={ParametersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          title: "Connexion / Inscription",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="NotificationsPage"
        component={NotificationScreen}
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="MatchScreen"
        component={MatchScreen}
        options={{
          title: "Détails du Match",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="Matchs"
        component={FixturesScreen}
        options={{
          title: "Matchs",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="Programme"
        component={ScheduleScreen}
        options={{
          title: "Programme",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
        <Drawer.Screen
          name="Admin Notifications"
          component={AdminNotificationScreen}
          options={{
            title: "Notifications Admin",
            headerStyle: { backgroundColor: "#1077a7" },
            headerTintColor: "#fff",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="megaphone-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Admin Fixtures"
          component={AdminFixturesScreen}
          options={{
            title: "Admin Fixtures",
            headerStyle: { backgroundColor: "#1077a7" },
            headerTintColor: "#fff",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="megaphone-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Admin Tablees"
          component={AdminTablesScreen}
          options={{
            title: "Admin Tables",
            headerStyle: { backgroundColor: "#1077a7" },
            headerTintColor: "#fff",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="megaphone-outline" size={size} color={color} />
            ),
          }}
        />
    </Drawer.Navigator>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("⚠️ Push notifications only work on physical devices.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("🚫 Notification permission not granted.");
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: "13865688-d0a4-4e46-897f-955163af129d", // ⚠️ Add this line
  });

  if (!token) {
    console.log("❌ No token received from Expo.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}



