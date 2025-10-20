import { Image, StyleSheet, View } from 'react-native';

const HeaderLogo = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Tofes_Icon.png')} // change to your logo path
        style={styles.logo}
      />
    </View>
  );
};

export default HeaderLogo;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,           // distance from the top
    right: 20,         // distance from the right
    zIndex: 1000,      // ensures it stays on top
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
