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

const historyData = async (user_id) => {
  const history = await db.collection("History_Review").doc(user_id).get();

  if (history != null) {
    return history.data();
  } else {
    console.log("Document not found");
  }
};

const favoriteUser = async (user_id) => {
  const history = await db.collection("favorite_place").doc(user_id).get();

  if (history != null) {
    return history.data();
  } else {
    console.log("Document not found");
  }
};

async function storeFavoritePlace(user_id, placeId, data) {
  const docRef = db.collection("favorite_place").doc(user_id);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({
      [placeId]: { ...data },
    });
  } else {
    await docRef.set({
      [placeId]: { ...data},
    });
  }
}

async function storeDataHistoryReview(user_id, placeId, dataReview) {
  const docRef = db.collection("History_Review").doc(user_id);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({
      [placeId]: { ...dataReview },
    });
  } else {
    await docRef.set({
      [placeId]: { ...dataReview },
    });
  }
}

module.exports = {
  destinations,
  storeDataHistoryReview,
  historyData,
  getEncode,
  getAllEncode,
  storeFavoritePlace,
  favoriteUser
};
