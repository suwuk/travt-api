const tf = require("@tensorflow/tfjs-node");
const { getAllEncode } = require("./Data_Connection");

async function recommendationDestination(
  model,
  userIdInput,
  placeInput,
  ratingUserInput,
  categoryInput,
  cityInput,
  ratingAllInput,
  verifiedInput
) {
  const encodeData = await getAllEncode();

  const userFullTensor = tf.tensor2d(
    new Array(encodeData.length).fill(Math.random() * 741),
    [encodeData.length, 1]
  );
  const placeIdFullTensor = tf.tensor2d(
    encodeData.map((d) => d.tempatId),
    [encodeData.length, 1]
  );
  const categoryFullTensor = tf.tensor2d(
    encodeData.map((d) => d.kategori),
    [encodeData.length, 1]
  );
  const cityFullTensor = tf.tensor2d(
    encodeData.map((d) => d.kota),
    [encodeData.length, 1]
  );
  // const ratingFullTensor = tf.tensor2d(encodeData.map(d => d.penilaian), [encodeData.length, 1]);
  const verifiedFullTensor = tf.tensor2d(
    encodeData.map((d) => d.terverifikasi),
    [encodeData.length, 1]
  );

  const ratingFullTensor = tf.tensor2d(
    new Array(742).fill(Math.random() * 1),
    [742, 1]
  );

  const predRatings = await model
    .predict([
      userFullTensor,
      placeIdFullTensor,
      categoryFullTensor,
      cityFullTensor,
      ratingFullTensor,
      verifiedFullTensor,
    ])
    .array();
  const mappedRatings = predRatings.map((rating, index) => ({
    place: index + 1,
    rating: rating[0],
  }));

  const hasil = mappedRatings
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20)
    .map((r) => r.place);

  return hasil;
}

// const prepareInputData = (
//   userIdInput,
//   placeInput,
//   ratingUserInput,
//   categoryInput,
//   cityInput,
//   ratingAllInput,
//   verifiedInput
// ) => {
//   const userIdTensor = tf.tensor2d(userIdInput, [userIdInput.length, 1]);
//   const placeTensor = tf.tensor2d(placeInput, [placeInput.length, 1]);
//   const ratingUserTensor = tf.tensor2d(ratingUserInput, [
//     ratingUserInput.length,
//     1,
//   ]);
//   const categoryTensor = tf.tensor2d(categoryInput, [categoryInput.length, 1]);
//   const cityTensor = tf.tensor2d(cityInput, [cityInput.length, 1]);
//   const ratingAllTensor = tf.tensor2d(ratingAllInput, [
//     ratingAllInput.length,
//     1,
//   ]);
//   const verifiedTensor = tf.tensor2d(verifiedInput, [verifiedInput.length, 1]);

//   return {
//     userIdTensor,
//     placeTensor,
//     ratingUserTensor,
//     categoryTensor,
//     cityTensor,
//     ratingAllTensor,
//     verifiedTensor,
//   };
// };

// async function trainModel(
//   model,
//   userIdTensor,
//   placeTensor,
//   ratingUserTensor,
//   categoryTensor,
//   cityTensor,
//   ratingAllTensor,
//   verifiedTensor
// ) {
//   const xs = [
//     userIdTensor,
//     placeTensor,
//     categoryTensor,
//     cityTensor,
//     ratingAllTensor,
//     verifiedTensor,
//   ];
//   const ys = ratingUserTensor;

//   await model.fit(tf.concat(xs, 1), ys, {
//     epochs: 1,
//     verbose: 0,
//   });
// }

// async function predictRatings(model) {
//   const encodeData = await getAllEncode();
//   // const allPlaces = Array.from(, (_, i) => i + 1);

//   const userFullTensor = tf.tensor2d(new Array(742).fill(0), [742, 1]);
//   const placeIdFullTensor = tf.tensor2d(
//     encodeData.map((d) => d.tempatId),
//     [742, 1]
//   );
//   const categoryFullTensor = tf.tensor2d(
//     encodeData.map((d) => d.kategori),
//     [742, 1]
//   );
//   const cityFullTensor = tf.tensor2d(
//     encodeData.map((d) => d.kota),
//     [742, 1]
//   );
//   const ratingFullTensor = tf.tensor2d(
//     encodeData.map((d) => d.penilaian),
//     [742, 1]
//   );
//   const verifiedFullTensor = tf.tensor2d(
//     encodeData.map((d) => d.terverifikasi),
//     [742, 1]
//   );
//   // user, place_id, category, city, rating, verified

//   // console.log(encodeData.map(d => d.tempatId))
//   // console.log(encodeData.map(d => d.kategori))
//   // console.log(encodeData.map(d => d.kota))
//   // console.log(encodeData.map(d => d.penilaian))
//   // console.log(encodeData.map(d => d.terverifikasi))
//   const predRatings = await model
//     .predict([
//       userFullTensor,
//       placeIdFullTensor,
//       categoryFullTensor,
//       cityFullTensor,
//       ratingFullTensor,
//       verifiedFullTensor,
//     ])
//     .array();

//   return predRatings.map((rating, index) => ({
//     place: index + 1,
//     rating: rating[0],
//   })); //[{place: 1, rating: 4},{place: 2, rating: 3},{place: 3, rating: 5},{place: 1, rating: 1}]
// }

// async function predictRatings(model) {
//   const encodeData = await getAllEncode();

//   const userFullTensor = tf.tensor2d(new Array(encodeData.length).fill(0), [encodeData.length, 1]);
//   const placeIdFullTensor = tf.tensor2d(encodeData.map(d => d.tempatId), [encodeData.length, 1]);
//   const categoryFullTensor = tf.tensor2d(encodeData.map(d => d.kategori), [encodeData.length, 1]);
//   const cityFullTensor = tf.tensor2d(encodeData.map(d => d.kota), [encodeData.length, 1]);
//   const ratingFullTensor = tf.tensor2d(encodeData.map(d => d.penilaian), [encodeData.length, 1]);
//   const verifiedFullTensor = tf.tensor2d(encodeData.map(d => d.terverifikasi), [encodeData.length, 1]);

//   const predRatings = await model.predict([userFullTensor, placeIdFullTensor, categoryFullTensor, cityFullTensor, ratingFullTensor, verifiedFullTensor]).array();

//   return predRatings.map((rating, index) => ({
//     place: encodeData[index].tempatId,
//     rating: rating[0],
//   }));
// }

// function getTop20Recommendations(predRatings) {
//   return predRatings
//     .sort((a, b) => b.rating - a.rating)
//     .slice(0, 20)
//     .map((r) => r.place); //[ 3, 1, 2 ]
// }

module.exports = {
  // prepareInputData,
  // trainModel,
  // predictRatings,
  // getTop20Recommendations,
  recommendationDestination,
};
