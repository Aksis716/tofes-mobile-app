// setAdmin.js (run on server or locally with admin credentials)
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  projectId: "tofes-e2b78",
});

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log("set admin claim for", uid);
}
