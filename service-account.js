const { Firestore } = require("@google-cloud/firestore");

const db = new Firestore({
    projectId: 'travt-database-8f5e3',
    keyFilename: "./service-account-firestore.json"
});

module.exports = db;