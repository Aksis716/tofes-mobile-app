import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ReglementationScreen() {
  const rules = [
    'Le tournoi opposera 08 équipes.',
    'Les matchs se joueront en deux (02) périodes de vingt-cinq (25) minutes séparées par une mi-temps de dix (10) minutes.',
    '12 joueurs par équipe (08 débutant le match et 04 de réserve).',
    'Les changements sont illimités pendant le jeu.',  
    'Tous les changements devront être notifiés à l’arbitre.', 
    'Tout changement non autorisé par l’arbitre est sanctionnable d’un carton jaune aux deux (02) joueurs concernés par le changement ainsi qu’au coach.',
    'Seuls les quatre (04) joueurs de réserve sont autorisés à jouer pour leurs équipes. Aucun joueur non prévu ne pourra participer aux matchs.',
    'En cas de carton rouge pendant un match, l’équipe sanctionnée terminera le match avec uniquement sept (07) joueurs sur le terrain.Elle jouera également son match suivant avec onze (11) joueurs (08 sur le terrain et 03 remplaçants).', 
    'Pendant la phase à élimination directe, en cas d’égalité à la fin de la deuxième période, une séance de tirs aux buts aura lieu afin de départager les deux (02) équipes. Ces dernières disposeront d’un temps de préparation de dix (10) minutes avant la séance de tirs aux buts.',
    'Quatre (04) tireurs par équipe participeront à la séance de tirs aux buts. En cas d’égalité après les huit (08) tirs, un tireur par équipe (différent des tireurs précédents) sera désigné pour tirer à tour de rôle jusqu’à l’obtention d‘un vainqueur.',
    'En cas d’indisponibilité d’un des joueurs pour raison opérationnelle, le capitaine de l’équipe est autorisé à le remplacer au sein de son effectif. Cependant, tout changement devra être notifié aux organisateurs au plus tard douze (12) heures avant un match.',
    'Les règles du fair-play doivent être respectées par tous les joueurs.                      ',
  ];

  return (
    <ScrollView>
    <View style={styles.container}>

      <Text style={styles.text}>Le règlement de la compétition est donné ci-dessous. Les différents capitaines d’équipe seront
         notifiés en cas de modifications futures de ce règlement. </Text>
      
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleItem}>
          <Icon name="caret-forward-outline" size={20} color="#1077a7ff" />
          <Text style={styles.ruleText}>{rule}</Text>
        </View>
      ))}

      <Text style={styles.text}>    </Text>

    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1077a7ff',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ruleText: {
    fontSize: 15,
    marginLeft: 15,
    flexShrink: 1, // wraps long text
  },
  text: {
    fontSize: 15,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
  },
});
