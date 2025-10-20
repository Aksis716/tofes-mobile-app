import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image, StyleSheet, View } from 'react-native';

export default function CustomDrawer(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Tofes_Icon.png')} // your logo here
          style={styles.logo}
        />
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: '#fff', // optional background for logo area
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});
