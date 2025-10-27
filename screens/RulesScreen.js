import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function ReglementationScreen() {
  const [selectedPhase, setSelectedPhase] = useState("general");

  const rules = [
    { text: "Le tournoi opposera 12 équipes.", phase: "general" },
    { text: "Les matchs se joueront en deux (02) périodes de vingt-cinq (25) minutes séparées par une mi-temps de dix (10) minutes.", phase: "general" },
    { text: "12 joueurs par équipe (08 débutant le match et 04 de réserve).", phase: "general" },
    { text: "Les changements sont illimités pendant le jeu.", phase: "general" },
    { text: "Tous les changements devront être notifiés à l’arbitre.", phase: "general" },
    { text: "Trois poules de quatre équipes chacune seront tirées au sort en présence de tous les capitaines d'équipe ou leurs représentants.", phase: "poule" },
    { text: "Tout changement non autorisé par l’arbitre est sanctionnable d’un carton jaune aux deux (02) joueurs concernés par le changement ainsi qu’au coach.", phase: "general" },
    { text: "Seuls les quatre (04) joueurs de réserve sont autorisés à jouer pour leurs équipes. Aucun joueur non prévu ne pourra participer aux matchs.", phase: "general" },
    { text: "En cas de carton rouge pendant un match, l’équipe sanctionnée terminera le match avec uniquement sept (07) joueurs sur le terrain. Elle jouera également son match suivant avec onze (11) joueurs (08 sur le terrain et 03 remplaçants).", phase: "general" },
    { text: "En cas d’égalité à la fin de la deuxième période, une séance de tirs aux buts aura lieu afin de départager les deux (02) équipes.", phase: "elimination" },
    { text: "Les équipes disposeront d’un temps de préparation de dix (10) minutes avant la séance de tirs aux buts.", phase: "elimination" },
    { text: "Quatre (04) tireurs par équipe participeront à la séance de tirs aux buts.", phase: "elimination" },
    { text: "En cas d’égalité après les huit (08) tirs, un tireur par équipe (différent des tireurs précédents) sera désigné pour tirer à tour de rôle jusqu’à l’obtention d‘un vainqueur.", phase: "elimination" },
    { text: "En cas d’indisponibilité d’un des joueurs pour raison opérationnelle, le capitaine de l’équipe est autorisé à le remplacer au sein de son effectif. Cependant, tout changement devra être notifié aux organisateurs au plus tard douze (12) heures avant un match.", phase: "general" },
    { text: "Les règles du fair-play doivent être respectées par tous les joueurs.", phase: "general" },
    { text: "Les deux premières équipes de chaque poule sont qualifiées pour la phase à élimination directe.", phase: "poule" },
    { text: "Deux parmi les trois équipes classées troisième de leurs poules seront qualifiées pour la phase à élimination directe.", phase: "poule" },
    { text: "L’ordre de priorité pour différencier les équipes est le suivant: nombre de points, différence de buts, résultat confrontation directe (si même poule), nombre de buts marqués et enfin nombre de buts encaissés.", phase: "poule" },
  ];

  const filteredRules = rules.filter(rule => rule.phase === selectedPhase);

  return (
    <View style={styles.container}>
      {/* 🧾 Always visible header */}
      <View style={styles.header}>

        {/* 🔘 Phase selector buttons */}
        <View style={styles.buttonContainer}>
          {[
            { label: "Règles Générales", value: "general" },
            { label: "Phase de Poules", value: "poule" },
            { label: "Élimination Directe", value: "elimination" },
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
            <Icon name="caret-forward-outline" size={20} color="#1077a7ff" />
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
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    fontSize: 15,
    marginBottom: 10,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f8fcffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonActive: {
    backgroundColor: "#1077a7ff",
  },
  buttonText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  buttonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollArea: {
    padding: 20,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 15,
    marginLeft: 10,
    flexShrink: 1,
  },
  noRulesText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
    fontStyle: "italic",
  },
});
