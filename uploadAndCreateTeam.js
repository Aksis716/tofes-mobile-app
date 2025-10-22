// uploadAndCreateTeam.js
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "./firebaseConfig";

export async function addTeam({ name, city, coach, localImageUri }) {
  // 1) upload image to storage
  const response = await fetch(localImageUri);
  const blob = await response.blob();

  const storageRef = ref(storage, `team_logos/${Date.now()}_${name}.png`);
  const uploadTask = await uploadBytesResumable(storageRef, blob);
  const url = await getDownloadURL(uploadTask.ref);

  // 2) create Firestore document
  const teamRef = await addDoc(collection(db, "teams"), {
    name,
    escadron,
    coach,
    logoUrl: url,
    createdAt: new Date(),
  });

  return { id: teamRef.id, logoUrl: url };
}
