import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");
const scale = width / 375; // base width for scaling (iPhone X width)
const verticalScale = height / 812; // base height for scaling

const responsive = (size) => Math.round(size * scale);
const vresponsive = (size) => Math.round(size * verticalScale);

export default function ReglementationScreen() {
  const [selectedPhase, setSelectedPhase] = useState("general");

  const rules = [
    { text: "Le tournoi opposera 14 équipes.", phase: "general" },
    { text: "Les matchs se joueront en deux (02) périodes de vingt-cinq (25) minutes séparées par une mi-temps de dix (10) minutes.", phase: "general" },
    { text: "Les équipes seront constituées de 12 joueurs (09 débutant le match et 03 remplaçants).", phase: "general" },
    { text: "Les changements sont illimités pendant le jeu.", phase: "general" },
    { text: "Tous les changements devront être notifiés à l’arbitre.", phase: "general" },
    { text: "Trois poules de quatre équipes chacune seront tirées au sort en présence de tous les capitaines d'équipe ou leurs représentants.", phase: "poule" },
    { text: "Tout changement non autorisé par l’arbitre est sanctionnable d’un carton jaune aux deux (02) joueurs concernés par le changement ainsi qu’au coach.", phase: "general" },
    { text: "Seuls les trois (03) joueurs remplaçants sont autorisés à jouer pour leurs équipes. Aucun joueur non prévu ne pourra participer aux matchs.", phase: "general" },
    { text: "En cas de carton rouge pendant un match, l’équipe sanctionnée terminera le match avec uniquement huit (08) joueurs sur le terrain. Cependant, elle jouera son match suivant avec une liste mise à jour de douze (12) joueurs n'incluant pas le joueur sanctionné.", phase: "general" },
    { text: "En cas d’égalité à la fin de la deuxième période, une séance de tirs aux buts aura lieu afin de départager les deux (02) équipes.", phase: "elimination" },
    { text: "Les équipes disposeront d’un temps de préparation de dix (10) minutes avant la séance de tirs aux buts.", phase: "elimination" },
    { text: "Quatre (04) tireurs par équipe participeront à la séance de tirs aux buts.", phase: "elimination" },
    { text: "En cas d’égalité après les huit (08) tirs, un tireur par équipe (différent des tireurs précédents) sera désigné pour tirer à tour de rôle jusqu’à l’obtention d‘un vainqueur.", phase: "elimination" },
    { text: "En cas d’indisponibilité d’un des joueurs pour raison opérationnelle, le coach de l’équipe est autorisé à le remplacer au sein de son effectif. Cependant, tout changement devra être notifié aux organisateurs au plus tard douze (12) heures avant un match.", phase: "general" },
    { text: "Les règles du fair-play doivent être respectées par tous les joueurs.", phase: "general" },
    { text: "Les deux premières équipes de chaque poule sont qualifiées pour la phase à élimination directe.", phase: "poule" },
    { text: "L’ordre de priorité pour différencier les équipes est le suivant: nombre de points, résultat confrontation directe, différence de buts générale, nombre de buts marqués, fairplay (nombre de cartons rouges puis jaunes) et enfin tirage au sort.", phase: "poule" },
  ];

  const filteredRules = rules.filter((rule) => rule.phase === selectedPhase);

  return (
    <View style={styles.container}>
      {/* 🧾 Always visible header */}
      <View style={styles.header}>
        {/* 🔘 Phase selector buttons */}
        <View style={styles.buttonContainer}>
          {[
            { label: "Règles Générales", value: "general" },
            { label: "Phase de Poules", value: "poule" },
            { label: "Phase Directe", value: "elimination" },
          ].map((btn) => (
            <TouchableOpacity
              key={btn.value}
              style={[
                styles.button,
                selectedPhase === btn.value && styles.buttonActive,
              ]}
              onPress={() => setSelectedPhase(btn.value)}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedPhase === btn.value && styles.buttonTextActive,
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.text}>
          Le règlement de la compétition est donné ci-dessous. Les différents
          capitaines d’équipe seront notifiés en cas de modifications futures de
          ce règlement.
        </Text>
      </View>

      {/* 📜 Scrollable rules */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {filteredRules.map((rule, index) => (
          <View key={index} style={styles.ruleItem}>
            <Icon name="caret-forward-outline" size={responsive(18)} color="#1077a7ff" />
            <Text style={styles.ruleText}>{rule.text}</Text>
          </View>
        ))}

        {filteredRules.length === 0 && (
          <Text style={styles.noRulesText}>Aucune règle disponible.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 40,
  },
  header: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: responsive(20),
    paddingTop: vresponsive(20),
    paddingBottom: vresponsive(10),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    fontSize: responsive(13,5),
    marginBottom: vresponsive(5),
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: vresponsive(15),
  },
  button: {
    paddingVertical: vresponsive(8),
    paddingHorizontal: responsive(15),
    borderRadius: 20,
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonActive: {
    backgroundColor: "#1077a7ff",
  },
  buttonText: {
    fontSize: responsive(12),
    color: "#333",
    fontWeight: "600",
  },
  buttonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollArea: {
    backgroundColor: "#f8fcffff",
    padding: responsive(18),
    marginHorizontal: responsive(15),
    marginTop: vresponsive(15),
    borderRadius: 25,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: vresponsive(40),
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vresponsive(8),
  },
  ruleText: {
    fontSize: responsive(13,5),
    marginLeft: responsive(8),
    flexShrink: 1,
    color: "#333",
  },
  noRulesText: {
    textAlign: "center",
    color: "gray",
    marginTop: vresponsive(20),
    fontStyle: "italic",
    fontSize: responsive(13),
  },
});
