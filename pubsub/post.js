const amqp = require("amqplib");

const postVideo = async (video) => {
  try {
    // 1 create a connection to RabbitMQ
    const connection = await amqp.connect("amqp://admin:password@localhost");

    // 2 create a channel
    const channel = await connection.createChannel();

    // 3 create exchange
    const nameExchange = "video_exchange";
    await channel.assertExchange(nameExchange, "fanout", {
      durable: true,
    });

    // 4 publish message to exchange
    channel.publish(nameExchange, "", Buffer.from(JSON.stringify(video)), {
      persistent: true, // Message will survive broker restart
      expiration: "10000", // Message will expire after 10 seconds
    });

    console.log(` [x] Sent video: ${JSON.stringify(video)}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.error("Error posting video:", error);
  }
};

const message = process.argv.slice(2).join(",") || "Hello, RabbitMQ!";

const video = {
  title: process.argv[2] || message,
  description: process.argv[3] || "Default Video Description",
  url: process.argv[4] || "http://example.com/video.mp4",
  timestamp: new Date().toISOString(),
};

postVideo(video);
