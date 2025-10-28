import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import React, { useContext } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";
import { ThemeContext } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { language, changeLanguage } = useContext(LanguageContext);

  // Privacy Modal
  const showPrivacy = () => {
    Alert.alert(
      "Confidentialité et Sécurité",
      "L’utilisation de cette application est réservée aux personnes autorisées. Toutes les informations collectées doivent rester confidentielles et ne doivent être partagées qu’avec les personnes appropriées. Tout abus, partage non autorisé ou comportement inapproprié peut entraîner des sanctions conformément aux règles de l’organisation.",
      [{ text: "OK" }]
    );
  };

  // Language Selector
  const handleLanguageChange = () => {
    Alert.alert(
      "Sélectionner la langue",
      "Choisissez la langue de l'application (requiert un redémarrage)",
      [
        {
          text: "Français",
          onPress: () => changeLanguage("fr"),
        },
        {
          text: "English",
          onPress: () => changeLanguage("en"),
        },
        { text: "Annuler", style: "cancel" },
      ]
    );
  };

  // Clear Cache
  const clearCache = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert(
        "Cache vidé",
        "Toutes les données temporaires ont été supprimées. L'application peut redémarrer."
      );
    } catch (e) {
      console.error("Error clearing cache:", e);
    }
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
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* Language */}
      <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
        <View style={styles.row}>
          <Ionicons name="globe-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Langue</Text>
        </View>
        <Text style={{ color: "#6c757d" }}>
          {language === "fr" ? "Français" : "English"}
        </Text>
      </TouchableOpacity>

      {/* Privacy */}
      <TouchableOpacity style={styles.settingItem} onPress={showPrivacy}>
        <View style={styles.row}>
          <Ionicons name="shield-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Confidentialité et Sécurité</Text>
        </View>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.settingItem}>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Version de l'application</Text>
        </View>
        <Text style={{ color: "#6c757d" }}>
          {Constants?.expoConfig?.version || "1.0.0"}
        </Text>
      </View>

      {/* Clear Cache */}
      <TouchableOpacity style={styles.settingItem} onPress={clearCache}>
        <View style={styles.row}>
          <Ionicons name="trash-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Vider le cache</Text>
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
