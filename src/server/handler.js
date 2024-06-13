const admin = require("firebase-admin");
const loadModel = require("../services/loadModel.js");
const recommendationDestination = require("../services/inferenceModel.js");
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const {
  destinations,
  getEncode,
  historyData,
  getIndexUser,
} = require("../services/Data_Connection.js");

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: process.env.DATABASE_URL,
});

let user_id;

const getUid = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);

    user_id = user.uid;

    res.status(200).json({ uid: user.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllData = async (req, res) => {
  if (destinations.length === 0) {
    res.status(200).send({
      status: "success",
      data: [],
    });
  } else {
    res.status(200).send({
      status: "success",
      data: destinations,
    });
  }
};

const getDataById = (req, res) => {
  const placeId = req.params.place_id;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[new Date().getDay()];

  const destination = destinations.filter(
    (d) => d.placeId.toString() === placeId
  )[0];

  if (destination !== undefined) {
    res.status(200).send({
      status: "success",
      day,
      data: destination,
    });
  } else {
    res.status(404).send({
      status: "fail",
      message: "destination tidak ditemukan",
    });
  }
};

const getPopularDestinations = (req, res) => {
  const popularDestination = destinations.filter(
    (d) => d.verified && d.rating >= 4.5
  );

  res.status(200).send({
    status: "success",
    data: popularDestination,
  });
};

const addHistoryReviewUser = async (req, res) => {
  try {
    const placeId = req.params.place_id;
    const { rating } = req.body;
    const encodeDetail = await getEncode(placeId);

    if (!placeId || !user_id) {
      return res.status(400).send({
        status: "error",
        message: "placeId atau user_id kosong",
      });
    }

    if (!rating) {
      return res.status(400).send({
        status: "error",
        message: "Jangan lupa isi rating ya...",
      });
    }

    const createdAt = new Date().toISOString();

    const dataRiview = {
      placeId: Number(placeId),
      rating_user: rating,
      category: encodeDetail.kategori,
      city: encodeDetail.kota,
      rating_place: encodeDetail.penilaian,
      verified: encodeDetail.terverifikasi,
      createdAt,
    };

    await storeDataHistoryReview(user_id, placeId, dataRiview);

    res.status(200).send({
      status: "success",
      message: "Berhasil Menyimpan data history",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

const getDataHistory = async (req, res) => {
  try {
    const historyUser = await historyData(user_id);

    res.status(200).send({
      status: "success",
      data: historyUser,
    });
  } catch (error) {
    console.error("Error retrieving history data: ", error);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getRecommendationDestination = async (req, res) => {
  const keyHistoryUser = Object.keys(await historyData(user_id));
  let historyUser = keyHistoryUser.map((id) => parseInt(id));

  const dataIndex = new Array(historyUser.length).fill(
    await getIndexUser(user_id)
  );

  const model = await loadModel();
  const hasil = await recommendationDestination(model, dataIndex, historyUser);

  res.status(200).send({
    status: "success",
    data: hasil,
  });
};

module.exports = {
  getDataById,
  getAllData,
  getPopularDestinations,
  addHistoryReviewUser,
  getDataHistory,
  getRecommendationDestination,
  getUid,
};
