import { addDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function postComment(matchId, authorId, authorName, text) {
  const commentsRef = collection(db, `matches/${matchId}/comments`);
  await addDoc(commentsRef, {
    authorId,
    authorName,
    text,
    createdAt: new Date(),
  });
}

// listening
export function listenComments(matchId, onChange) {
  const q = query(collection(db, `matches/${matchId}/comments`), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(comments);
  });
}
