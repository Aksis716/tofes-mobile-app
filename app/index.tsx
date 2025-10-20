import * as React from 'react';

import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import FixturesScreen from '../screens/FixturesScreen';
import HomeScreen from '../screens/HomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import StandingsScreen from '../screens/StandingsScreen';

import ParametersScreen from '../screens/ParametersScreen';
import RulesScreen from '../screens/RulesScreen';
import TeamDetailsScreen from '../screens/TeamDetailsScreen';
import TeamsScreen from '../screens/TeamsScreen';
import WinnersScreen from '../screens/WinnersScreen';

import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Programme') iconName = 'calendar-outline';
          else if (route.name === 'Résultats') iconName = 'trophy-outline';
          else if (route.name === 'Classement') iconName = 'stats-chart-outline';
          else iconName = 'football-outline';
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
          component={FixturesScreen}
          options={{
            headerShown: false,
          }}
      />
      <Tab.Screen
          name="Résultats"
          component={ResultsScreen}
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
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
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
      }}
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
    </Drawer.Navigator>
  );
}
