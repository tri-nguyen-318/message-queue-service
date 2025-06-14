const amqp = require("amqplib");

async function sendMessage(message) {
  try {
    // Connect to RabbitMQ server

    // 1 create a connection to RabbitMQ
    const connection = await amqp.connect("amqp://admin:password@localhost");
    // 2 create a channel
    const channel = await connection.createChannel();

    const queue = "test_queue";

    // 3 Assert the queue exists (creates if it doesn't)
    await channel.assertQueue(queue, { durable: true });

    // 4 Send message to queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true, // Message will survive broker restart
      expiration: "10000", // Message will expire after 10 seconds
    });

    console.log(` [x] Sent message: ${JSON.stringify(message)}`);

    // Close the connection after a short delay
    // setTimeout(() => {
    //   connection.close();
    //   process.exit(0);
    // }, 500);
  } catch (error) {
    console.error("Error:", error);
  }
}

const message = process.argv.slice(2).join(",") || "Hello, RabbitMQ!";

const messageObject = {
  text: message,
  timestamp: new Date().toISOString(),
};

sendMessage(messageObject);
