const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  getDataById,
  getAllData,
  getPopularDestinations,
  addHistoryReviewUser,
  getDataHistory,
  getRecommendationDestination,
  getUid,
} = require("./handler.js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.post("/login", getUid);
app.get("/destination", getAllData);
app.get("/destination/popular", getPopularDestinations);
app.get("/destination/:place_id", getDataById);
app.post("/destination/:place_id/review/create", addHistoryReviewUser);
app.get("/review/history", getDataHistory);
app.get("/recommendation", getRecommendationDestination);

app.listen(PORT, HOST, () => {
  console.log("Server already running on port 3000");
});
