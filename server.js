const express = require("express");
const destinations = require("./Data.js")

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.get("/", (req, res) => {

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
