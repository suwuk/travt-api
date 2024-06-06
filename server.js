const express = require("express");
const admin = require("firebase-admin");
const db = require("./service-account.js")

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const destinations = [];

app.get("/", async (req, res) => {
  
  await db
    .collection("Destination")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        destinations.push(doc.data());
      });
    });

  res.status(200).send({
    status: "success",
    data: destinations,
  });
});


app.get('/:place_id', (req,res) => {
  const placeId = req.params.place_id

  const destination = destinations.filter((d) => d.place_id === placeId)[0]

  res.status(200).send({
    status: "success",
    data: destination
  });
})

app.listen(PORT, HOST,() => {
  console.log("Server already running on port 3000");
});
