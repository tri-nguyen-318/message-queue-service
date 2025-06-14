const amqp = require("amqplib");

async function consumeMessages() {
  try {
    // Connect to RabbitMQ server
    // 1 create a connection to RabbitMQ
    const connection = await amqp.connect("amqp://admin:password@localhost");

    // 2 create a channel
    const channel = await connection.createChannel();

    const queue = "test_queue";

    // Assert the queue exists
    // 3 Assert the queue exists (creates if it doesn't)
    await channel.assertQueue(queue, { durable: true });

    // Only process one message at a time
    channel.prefetch(1);

    console.log(" [*] Waiting for messages. To exit press CTRL+C");

    // Consume messages from the queue
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());
          console.log(` [x] Received ${JSON.stringify(message)}`);

          // Simulate processing
          setTimeout(() => {
            console.log(" [x] Done processing");
            channel.ack(msg); // Acknowledge message processing
          }, 1000);
        }
      },
      {
        noAck: false, // Manual acknowledgment mode
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

consumeMessages();
