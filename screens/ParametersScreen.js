import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("Français");

  const handleLanguageChange = () => {
    Alert.alert(
      "Sélectionner la langue",
      "Fonctionnalité à rajouter!",
      [{ text: "OK", onPress: () => {} }],
      { cancelable: true }
    );
  };

  const handleFavoriteTeam = () => {
    Alert.alert("Équipe Préférée", "Fonctionnalité à rajouter!");
  };

  const handlePrivacy = () => {
    Alert.alert("Confidentialité et Sécurité", "Fonctionnalité à rajouter!");
  };

  const handleAbout = () => {
    Alert.alert(
      "À Propos",
      "TOFES v1.0\nSystème d'alerte et de suivi du tournoi de football de la BA 101."
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 15 }}>
      {/* Theme */}
      <View style={styles.settingItem}>
        <View style={styles.row}>
          <Ionicons
            name={isDarkMode ? "moon" : "sunny-outline"}
            size={22}
            color="#1077a7ff"
          />
          <Text style={styles.settingText}>Mode Sombre</Text>
        </View>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>

      {/* Notifications */}
      <View style={styles.settingItem}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      {/* Language */}
      <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
        <View style={styles.row}>
          <Ionicons name="globe-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Langue</Text>
        </View>
        <Text style={{ color: "#6c757d" }}>{language}</Text>
      </TouchableOpacity>

      {/* Favorite Team */}
      <TouchableOpacity style={styles.settingItem} onPress={handleFavoriteTeam}>
        <View style={styles.row}>
          <Ionicons name="heart-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Équipe Préférée</Text>
        </View>
        <Text style={{ color: "#6c757d" }}>Pas de sélection</Text>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
        <View style={styles.row}>
          <Ionicons name="shield-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Confidentialité et Sécurité</Text>
        </View>
      </TouchableOpacity>

      {/* About */}
      <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>À Propos</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = {
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
};
