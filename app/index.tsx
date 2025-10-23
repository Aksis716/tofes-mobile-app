import * as React from 'react';
import { useEffect, useRef, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

import { EventSubscription } from "expo-modules-core";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import FixturesScreen from '../screens/FixturesScreen';
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import StandingsScreen from '../screens/StandingsScreen';

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

const notificationListener = useRef<EventSubscription | null>(null);
const responseListener = useRef<EventSubscription | null>(null);

useEffect(() => {
  registerForPushNotificationsAsync().then(token => {
    console.log("Expo Push Token:", token);
  });

  notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    console.log("📢 Notification Received:", notification);
  });

  responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    console.log("👉 Notification Clicked:", response);
  });

  return () => {
    notificationListener.current && notificationListener.current.remove();
    responseListener.current && responseListener.current.remove();
  };
}, []);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await updateDoc(doc(db, "users", user.uid), { expoToken: token });
        console.log("✅ Expo push token saved for user:", user.uid);
      }
    }
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
      {/* Notifications Page */}
      <TouchableOpacity onPress={() => navigation.navigate("NotificationsPage")}>
        <Ionicons
          name="notifications-outline"
          size={28}
          color="#fff"
          style={{ marginRight: 15 }}
        />
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
    </Drawer.Navigator>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("Push notifications only work on physical devices.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Permission for notifications denied.");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
