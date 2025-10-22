// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

exports.onMatchUpdate = functions.firestore
  .document('fixtures/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // example: detect a goal change. You need to model your fixtures so you can detect goals
    if (after.score !== before.score) {
      // compose message
      const message = {
        title: `Goal! ${after.teamA} ${after.scoreA}-${after.scoreB} ${after.teamB}`,
        body: `Live update: a goal just scored.`,
      };

      // get all expo tokens (simple approach - avoid sending to everyone in prod)
      const tokensSnap = await admin.firestore().collection('users').where('expoPushToken','!=', null).get();
      const tokens = tokensSnap.docs.map(d => d.data().expoPushToken).filter(Boolean);

      // chunk tokens and send to Expo push API
      const sendChunk = async (chunk) => {
        const messages = chunk.map(token => ({
          to: token,
          sound: 'default',
          title: message.title,
          body: message.body,
        }));
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
      };

      // simple chunking
      while (tokens.length) {
        await sendChunk(tokens.splice(0, 100));
      }
    }
  });
