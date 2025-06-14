const amqp = require("amqplib");

const sendEmail = async () => {
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

    // 4 publish email
    const args = process.argv.slice(2);
    const msg = args[1] || "Hello, RabbitMQ!";
    const topic = args[0] || "email.send";

    console.log(` [x] Sending message: ${msg}`);
    console.log(` [x] Sending message to topic: ${topic}`);

    channel.publish(nameExchange, topic, Buffer.from(msg), {
      persistent: true, // Message will survive broker restart
      expiration: "10000", // Message will expire after 10 seconds
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.error("Error posting video:", error);
  }
};

sendEmail();
