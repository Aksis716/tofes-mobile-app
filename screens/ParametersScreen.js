import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, View, useWindowDimensions } from "react-native";

export default function SettingsScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 50 }}>
      {/* Privacy & Security */}
      <View style={styles.settingItemVertical}>
        <View style={styles.row}>
          <Ionicons name="football-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>
            TOFES - Décembre 2025 / Février 2026
          </Text>
        </View>

        <View
          style={[
            styles.midImage,
            {
              marginTop: -height * 0.04,
              marginBottom: -height * 0.04,
            },
          ]}
        >
          <Image
            source={require("../assets/images/Tournoi.png")}
            style={{
              width: width * 0.75,
              height: width * 0.75,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Always visible TOFES text */}

        <Text style={styles.privacyText}>
          Le sport constitue un élément important de la vie quotidienne des
          militaires. Les activités sportives, en particulier celles qui se font
          en équipe, permettent de développer, renforcer et maintenir un esprit
          de cohésion et de compétitivité saine au sein de nos Forces Armées.
        </Text>

        <Text style={styles.privacyText}>
          C’est dans cette optique qu’une compétition de football a été initiée
          au sein de la Base Aérienne 101. Elle oppose les différents Escadrons
          et Services dans un tournoi en poules suivi d’une phase à élimination
          directe.
        </Text>
      </View>

      {/* Privacy & Security */}
      <View style={styles.settingItemVertical}>
        <View style={styles.row}>
          <Ionicons name="shield-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Confidentialité et Sécurité</Text>
        </View>

        {/* Always visible privacy text */}
        <Text style={styles.privacyText}>
          L’utilisation de cette application est exclusivement réservée aux
          personnes autorisées. Toutes les informations affichées doivent rester
          confidentielles et ne doivent être partagées qu’avec les personnes
          appropriées. Tout abus, partage non autorisé ou comportement
          inapproprié peut entraîner des sanctions conformément aux règles de
          l’organisation.
        </Text>
      </View>

      {/* Development Team */}
      <View style={styles.settingItemVertical}>
        <View style={styles.row}>
          <Ionicons name="people-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Concepteurs</Text>
        </View>
        <Text style={styles.privacyText}>
          Cette application a été développée par le comité d'organisation du
          TOFES afin de faciliter le partage d'informations et le suivi du
          tournoi. Tous les remarques ou suggestions pouvant contribuer à
          l'amélioration de cette application peuvent être soumises aux membres
          du comité d'organisation.
        </Text>
      </View>

      {/* Version */}
      <View style={styles.settingItem}>
        <View style={styles.row}>
          <Ionicons name="information-outline" size={22} color="#1077a7ff" />
          <Text style={styles.settingText}>Version</Text>
        </View>
        <Text style={styles.privacyText}>1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = {
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fcffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },

  // Vertical layout for the privacy block
  settingItemVertical: {
    backgroundColor: "#f8fcffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  settingText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  privacyText: {
    marginTop: 6,
    color: "#6c757d",
    lineHeight: 20,
  },

  
  midImage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
};
