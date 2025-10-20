import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (

    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.header}>Tournoi de Football des Escadrons et Services</Text>

      <Text style={styles.title}>4ème Edition - Janvier 2026</Text>

      <Image
        source={require('../assets/images/Tournoi.png')}  // relative path
        style={styles.image}
        resizeMode="contain"  // or "cover", "stretch", etc.
      />

      <Text style={styles.text}>Le sport constitue un élément important de la vie quotidienne des militaires. La condition physique
        personnelle, la santé mentale et les performances opérationnelles sont intimement liées. </Text>
        
      <Text style={styles.text}>En effet, les activités sportives en général, et celles qui se font en équipe en particulier, permettent
        également de développer, renforcer et maintenir un esprit de cohésion et de compétitivité saine au sein de nos Forces Armées.</Text>

      <Text style={styles.text}>C'est dans cette optique qu'une compétition de football a été initiée au sein de la Base Aérienne 101. Elle
        est organisée chaque année tant que les activités opérationnelles le permettent.</Text>

      <Text style={styles.text}>Cette compétition oppose les différents escadrons et services dans un tournoi en poules suivi d'une phase à élimination directe.</Text>

    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', paddingTop: 30 },
  text: {
    fontSize: 15,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1077a7ff',
  },
  header: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1077a7ff',
  },
  image: {
    width: 320,   // must set width and height!
    height: 320,
  },
    image2: {
    width: 400,   // must set width and height!
    height: 400,
  },
});