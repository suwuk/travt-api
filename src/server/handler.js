const admin = require("firebase-admin");
const loadModel = require("../services/loadModel.js");
const {
  prepareInputData,
  trainModel,
  predictRatings,
  getTop20Recommendations,
  recommendationDestination,
} = require("../services/inferenceModel.js");
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const jwt = require("jsonwebtoken");
const {
  destinations,
  getEncode,
  historyData,
  getIndexUser,
  storeDataHistoryReview,
} = require("../services/Data_Connection.js");

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const secretKey = process.env.SECRET_KEY;

const generateToken = (userId) => {
  return jwt.sign({ userId }, secretKey, { expiresIn: "30d" });
};

const getUid = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    const token = generateToken(user.uid);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user_id = user.userId;
    next();
  });
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

const getDataById = async (req, res) => {
  const placeId = req.params.place_id;
  const dataHistoryUser = await historyData(req.user_id);
  const ratingDetail = dataHistoryUser[placeId]?.rating_user;

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
      data: { ...destination, day, rating_user: ratingDetail ?? 0 },
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

    if (!placeId || !req.user_id) {
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

    await storeDataHistoryReview(req.user_id, placeId, dataRiview);

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
    const historyUser = await historyData(req.user_id);

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
  const valueHistoryUser = Object.values(await historyData(req.user_id));

  const userIdInput = new Array(valueHistoryUser.length).fill(27500);
  const placeInput = valueHistoryUser.map((v) => v.placeId);
  const ratingAllInput = valueHistoryUser.map((v) => v.rating_place);
  const categoryInput = valueHistoryUser.map((v) => v.category);
  const cityInput = valueHistoryUser.map((v) => v.city);
  const ratingUserInput = valueHistoryUser.map((v) => v.rating_user);
  const verifiedInput = valueHistoryUser.map((v) => v.verified);

  const model = await loadModel();

  const hasil = await recommendationDestination(
    model,
    userIdInput,
    placeInput,
    ratingUserInput,
    categoryInput,
    cityInput,
    ratingAllInput,
    verifiedInput
  );

  res.status(200).send({
    status: "success",
    data: hasil,
  });
  // const {
  //   userIdTensor,
  //   placeTensor,
  //   ratingUserTensor,
  //   categoryTensor,
  //   cityTensor,
  //   ratingAllTensor,
  //   verifiedTensor,
  // } = prepareInputData(
  //   userIdInput,
  //   placeInput,
  //   ratingUserInput,
  //   categoryInput,
  //   cityInput,
  //   ratingAllInput,
  //   verifiedInput
  // );
  // // const hasil = await recommendationDestination(model, dataIndex, historyUser);
  // await trainModel(
  //   model,
  //   userIdTensor,
  //   placeTensor,
  //   ratingUserTensor,
  //   categoryTensor,
  //   cityTensor,
  //   ratingAllTensor,
  //   verifiedTensor
  // );
  // // console.log(ratingAllTensor)
  // const predRatings = await predictRatings(model);

  // const rekomendasiPlaceIds = getTop20Recommendations(predRatings);

  // res.status(200).send({
  //   status: "success",
  //   data: rekomendasiPlaceIds,
  // });
};

// (async function () {
//   const model = await loadModel();

//   const predRatings = await predictRatings(model);

//   const rekomendasiPlaceIds = getTopNRecommendations(predRatings, 10);

//   console.log("Rekomendasi untuk pengguna baru:", rekomendasiPlaceIds);
// })();

module.exports = {
  getDataById,
  getAllData,
  getPopularDestinations,
  addHistoryReviewUser,
  getDataHistory,
  getRecommendationDestination,
  getUid,
  authenticateToken,
};
