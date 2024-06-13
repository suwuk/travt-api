const tf = require('@tensorflow/tfjs-node');

async function recommendationDestination(model, dataIndex, historyUser){
    const tensor1 = tf.tensor(dataIndex).reshape([-1, 1]);
    const tensor2 = tf.tensor(historyUser).reshape([-1, 1]);
 
    const predict = model.predict([tensor1, tensor2]);
    return await predict.data()
}

module.exports = recommendationDestination;