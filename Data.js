const { Firestore } = require("@google-cloud/firestore");

const db = new Firestore({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const destinations = [];

const getAllData = async () => {
  await db
    .collection("Destination")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        destinations.push(doc.data());
      });
    });
};

getAllData()

module.exports = destinations;
