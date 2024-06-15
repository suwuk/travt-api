const { Firestore } = require("@google-cloud/firestore");

const db = new Firestore({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.FIRESTORE_SERVICE_ACCOUNT,
});

const destinations = [];

const getDestination = async () => {
  await db
    .collection("Destinations")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        destinations.push(doc.data());
      });
    });
};
getDestination();

const getEncode = async (place_id) => {
  const historyEncode = await db.collection("place_encode").doc(place_id).get();

  if (historyEncode != null) {
    return historyEncode.data();
  } else {
    console.log("Document not found");
  }
};

const getAllEncode = async () => {
  try {
    const place = [];
    await db
      .collection("place_encode")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          place.push(doc.data());
        });
      });
    return place;
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
};

const getIndexUser = async (user_id) => {
  let index = 0;
  let foundIndex = -1;

  try {
    const snapshot = await db.collection("History_Review").get();
    snapshot.forEach((doc) => {
      if (doc.id === user_id) {
        foundIndex = index;
      }
      index++;
    });
  } catch (error) {
    console.error("Error getting documents: ", error);
  }

  return foundIndex;
};

const historyData = async (user_id) => {
  const history = await db.collection("History_Review").doc(user_id).get();

  if (history != null) {
    return history.data();
  } else {
    console.log("Document not found");
  }
};

async function storeDataHistoryReview(user_id, placeId, dataRiview) {
  db.collection("History_Review")
    .doc(user_id)
    .update({
      [placeId]: { ...dataRiview },
    });
}

module.exports = {
  destinations,
  getIndexUser,
  storeDataHistoryReview,
  historyData,
  getEncode,
  getAllEncode,
};
