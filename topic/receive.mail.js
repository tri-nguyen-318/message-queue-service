const amqp = require("amqplib");

const receiveMail = async () => {
  try {
    // 1 create a connection to RabbitMQ
    const connection = await amqp.connect("amqp://admin:password@localhost");

    // 2 create a channel
    const channel = await connection.createChannel();

    // 3 create exchange
    const nameExchange = "send_mail";
    await channel.assertExchange(nameExchange, "topic", {
      durable: true,
    });

    // 4 create a queue
    const { queue } = await channel.assertQueue("", {
      exclusive: true, // Queue will be deleted when the connection closes
    });

    console.log(` [*] Waiting for messages in queue: ${queue}`);

    // 5 bind the queue to the exchange

    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.log("Usage: receiveMail <binding_key>");
      process.exit(0);
    }

    console.log("Waiting for messages with binding key:", args[0]);

    args.forEach(async (bindingKey) => {
      await channel.bindQueue(queue, nameExchange, bindingKey);
    });

    // 6 consume messages from the queue
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          console.log("🚀 ~ receiveMail ~ msg:", msg.fields.routingKey);
          const mail = msg.content.toString();
          console.log(` [x] Received video: ${mail}`);
          // Acknowledge the message
          channel.ack(msg);
        }
      },
      {
        noAck: false, // Acknowledge messages manually
      }
    );
  } catch (error) {
    console.error("Error posting video:", error);
  }
};

receiveMail();
