
// expoPushTokens.js
import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  // save token to user doc
  if (auth.currentUser) {
    await setDoc(doc(db, 'users', auth.currentUser.uid), { expoPushToken: token }, { merge: true });
  }
  return token;
}
