const amqp = require("amqplib");

const receiveNoti = async () => {
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

    // 4 create a queue
    const { queue } = await channel.assertQueue("", {
      exclusive: true, // Queue will be deleted when the connection closes
    });

    console.log(` [*] Waiting for messages in queue: ${queue}`);

    // 5 bind the queue to the exchange
    await channel.bindQueue(queue, nameExchange, "");
    // 6 consume messages from the queue
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          const video = JSON.parse(msg.content.toString());
          console.log(` [x] Received video: ${JSON.stringify(video)}`);
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

receiveNoti();
