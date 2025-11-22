import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as Updates from 'expo-updates';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import * as React from 'react';
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomDrawer from '../components/CustomDrawer';
import { LanguageProvider } from "../contexts/LanguageContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { auth, db } from "../firebaseConfig";

// Screens
import AuthScreen from '../screens/AuthScreen';
import FixturesScreen from '../screens/FixturesScreen';
import HomeScreen from '../screens/HomeScreen';
import MatchScreen from '../screens/MatchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ParametersScreen from '../screens/ParametersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RulesScreen from '../screens/RulesScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import StandingsScreen from '../screens/StandingsScreen';
import TeamDetailsScreen from '../screens/TeamDetailsScreen';
import TeamsScreen from '../screens/TeamsScreen';
import WinnersScreen from '../screens/WinnersScreen';

// Admin Screens
import AdminCommentsScreen from '../screens/AdminCommentsScreen';
import AdminDevicesScreen from '../screens/AdminDevicesScreen';
import AdminFixturesScreen from '../screens/AdminFixturesScreen';
import AdminNotificationScreen from "../screens/AdminNotificationScreen";
import AdminTablesScreen from '../screens/AdminTablesScreen';
import AdminTeamsScreen from '../screens/AdminTeamsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Get screen dimensions
const { width } = Dimensions.get('window');
const isSmallDevice = width < 360; // e.g., small Androids

// 🔹 Use SafeArea for iPhones and Android status bar
function SafeAreaWrapper({ children }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {children}
    </SafeAreaView>
  );
}

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
  const insets = useSafeAreaInsets();

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
        tabBarInactiveTintColor: '#7a8388ff',
        tabBarLabelStyle: {
          fontSize: isSmallDevice ? 10 : 12,
        },
        tabBarStyle: {
          position: 'absolute',
          left: width * 0.05,
          right: width * 0.05,
          elevation: 5,
          borderRadius: 25,
          borderTopWidth: 0,
          paddingBottom: insets.bottom + 10,
          height: (isSmallDevice ? 40 : 55) + insets.bottom,
          backgroundColor: '#f8fcffff',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
        },
        headerShown: false,
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
const [user, setUser] = useState<any>(null);
const [userRole, setUserRole] = useState<string | null>(null); // ✅ new state for role

  // 🔹 Watch for auth state and fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // get the role from Firestore
        const userDoc = doc(db, "users", u.uid);
        const snapshot = await getDocs(collection(db, "users"));
        const found = snapshot.docs.find(d => d.id === u.uid);
        if (found) {
          const role = found.data().role;
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });
    return unsubscribe;
  }, []);

  // 🔹 Handle logout
  const handleLogout = async () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            setUser(null);
            setUserRole(null);
            Alert.alert("Déconnexion réussie !");
          },
        },
      ]
    );
  };

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


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);


const TopRightIcons = ({ navigation }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
    {/* Notifications */}
    <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
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
          navigation.navigate("Authentification");
        }
      }}
    >
      <Ionicons name="person-circle-outline" size={35} color="#fff" />
    </TouchableOpacity>
  </View>
);

  
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaWrapper>
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: "slide",
        headerShown: true,
        drawerActiveTintColor: "#1077a7ff", // active item color
        drawerInactiveTintColor: "gray",
        drawerStyle: {
          backgroundColor: "#fff",
          width: width * 0.7, // adaptive drawer width
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
      {/* 🌍 Public or shared pages */}
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
        name="À propos"
        component={ParametersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🔐 Auth screens (hidden from drawer) */}
      <Drawer.Screen
        name="Authentification"
        component={AuthScreen}
        options={{
          title: "Connexion / Inscription",
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
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: "#1077a7" },
          headerTintColor: "#fff",
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="Détails du Match"
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

      {/* ⚙️ Admin access (admin + creator only) */}
      {(userRole === "admin" || userRole === "creator") && (
        <>
          <Drawer.Screen
            name="Admin Teams"
            component={AdminTeamsScreen}
            options={{
              title: "Admin Equipes",
              headerStyle: { backgroundColor: "#1077a7" },
              headerTintColor: "#fff",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="people-sharp" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Admin Matchs"
            component={AdminFixturesScreen}
            options={{
              title: "Admin Matchs",
              headerStyle: { backgroundColor: "#1077a7" },
              headerTintColor: "#fff",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="football-sharp" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Admin Tables"
            component={AdminTablesScreen}
            options={{
              title: "Admin Tables",
              headerStyle: { backgroundColor: "#1077a7" },
              headerTintColor: "#fff",
              drawerIcon: ({ color, size }) => (
                <Ionicons
                  name="stats-chart-sharp"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Admin Notifications"
            component={AdminNotificationScreen}
            options={{
              title: "Admin Notifications",
              headerStyle: { backgroundColor: "#1077a7" },
              headerTintColor: "#fff",
              drawerIcon: ({ color, size }) => (
                <Ionicons
                  name="notifications-circle-sharp"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Admin Commentaires"
            component={AdminCommentsScreen}
            options={{
              title: "Admin Commentaires",
              headerStyle: { backgroundColor: "#1077a7" },
              headerTintColor: "#fff",
              drawerIcon: ({ color, size }) => (
                <Ionicons
                  name="chatbubble-sharp"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}

      {/* 👑 Creator only */}
      {userRole === "creator" && (
        <>
        <Drawer.Screen
          name="Admin Users"
          component={AdminUsersScreen}
          options={{
            title: "Admin Utilisateurs",
            headerStyle: { backgroundColor: "#1077a7" },
            headerTintColor: "#fff",
            drawerIcon: ({ color, size }) => (
              <Ionicons
                name="people-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
            name="Admin Plateformes"
            component={AdminDevicesScreen}
            options={{
              title: "Admin Plateformes",
              headerStyle: { backgroundColor: "#1077a7" },
              headerTintColor: "#fff",
              drawerIcon: ({ color, size }) => (
                <Ionicons
                  name="phone-portrait"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}
    </Drawer.Navigator>
        </SafeAreaWrapper>
      </LanguageProvider>
    </ThemeProvider>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Erreur", "Les notifications push ne fonctionnent que sur un vrai appareil.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Permission refusée", "Activez les notifications dans les paramètres du téléphone.");
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: "13865688-d0a4-4e46-897f-955163af129d",
    });

    if (!token) {
      console.log("❌ Aucun token reçu depuis Expo.");
      Alert.alert("Erreur", "Impossible d’obtenir le token de notification.");
      return null;
    }

    console.log("✅ Token obtenu:", token);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (err) {
    console.error("Erreur en obtenant le token:", err);
    Alert.alert("Erreur", "Une erreur s’est produite en configurant les notifications.");
    return null;
  }
}




