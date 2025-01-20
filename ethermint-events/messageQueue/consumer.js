const amqp = require("amqplib");
const { loadContract } = require("../utils/contract.js");
const {
  UPPER_LAYER_INCOMING,
  LOWER_LAYER_INCOMING,
  RABBITMQ_HOST
} = require("../constants/constants.js");

let connection;
let channel;
async function listenFor(queueName) {
  try {
    const contract = loadContract();
    // Connect to RabbitMQ server
    connection = await amqp.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();

    // Ensure the queue exists
    await channel.assertQueue(queueName, { durable: true });

    console.log("Waiting for messages in queue:", queueName);

    // Consume messages from the queue
    await channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        console.log("Received message:", message);
        // Convert to Unix timestamp in seconds
        const unixTimestamp = Math.floor(
          new Date(message.timestamp).getTime() / 1000
        );

        if (queueName.includes("incoming")) {
          try {
            console.log("Receiving validation from laower layer");
            const data = await contract.write.validateData([message.dataID]);
            console.log(`Data Validated Hash: ${data}`);
          }catch (error) { 
            console.log("Failed to validate data:", error);
          }
        } else {
          try {
            const data = await contract.write.submitIoTData([
              message.dataId || message.dataID,
              message.deviceID,
              message.dataHash,
              unixTimestamp,
            ]);
            console.log(`Data Submitted Hash: ${data}`);
          } catch (error) {
            console.error("Failed to submit data:", error);
          }
        }

        // Acknowledge the message as processed
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(`Failed to listen to queue ${queueName}:`, error);
  }
}


async function main() {
  try {
    console.log("Start listening to the queue")
if (UPPER_LAYER_INCOMING !== "NONE") {
  listenFor(UPPER_LAYER_INCOMING).then(() => {
    console.log("Listening for messages in queue:", UPPER_LAYER_INCOMING);
  });
}
if (LOWER_LAYER_INCOMING !== "NONE") {
  listenFor(LOWER_LAYER_INCOMING).then(() => {
    console.log("Listening for messages in queue:", LOWER_LAYER_INCOMING);
  });
}
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.error);


process.on("SIGINT", async () => {
  console.log("Caught interrupt signal");
  await channel.close();
  await connection.close();
  process.exit();
});
