const admin = require('firebase-admin');

const serviceAccount = require('./blockchain-1-firebase-adminsdk-477z7-286990727e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://blockchain-1.firebaseio.com'
});

console.log('Firebase Admin Initialized');

module.exports = admin;
