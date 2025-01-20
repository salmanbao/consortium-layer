const amqp = require("amqplib");
const {
  RABBITMQ_HOST,
  UPPER_LAYER_INCOMING,
  UPPER_LAYER_OUTGOING,
  LOWER_LAYER_INCOMING,
  LOWER_LAYER_OUTGOING
} = require("../constants/constants.js");

async function sendToQueue(message, queueName) {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect(RABBITMQ_HOST);
    const channel = await connection.createChannel();

    // Ensure the queue exists
    await channel.assertQueue(queueName, { durable: true });

    // Send message to the queue
    console.log("Sending message:", message);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));

    // Close the connection and channel
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(`Failed to send message to queue ${queueName}:`, error);
  }
}

async function handleFabricToEthermintEvent(event) {
  await sendToQueue(event, UPPER_LAYER_INCOMING);
}

async function handleEthermintToFabricEvent(event) {
  await sendToQueue(event, UPPER_LAYER_OUTGOING);
}

async function handleEthermintUpperToEthermintLowerEvent(event) {
  await sendToQueue(event, LOWER_LAYER_OUTGOING);
}

async function handleEthermintLowerToEthermintUpperEvent(event) {
  await sendToQueue(event, LOWER_LAYER_INCOMING);
}

module.exports = {
  handleFabricToEthermintEvent,
  handleEthermintToFabricEvent,
  handleEthermintUpperToEthermintLowerEvent,
  handleEthermintLowerToEthermintUpperEvent
};
