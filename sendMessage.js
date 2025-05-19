const { getLeastLoadedQueue } = require("./getLeastQueue");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

// 메세지 발행
const publishMsg = (ch, exchange, routingKey, msg) => {
  ch.publish(exchange, routingKey, Buffer.from(msg), {
    persistent: true,
  });
  console.log(
    `[SEND] Sent message to exchange "${exchange}" with routing key "${routingKey}":`,
    msg
  );
};

// 메세지 소비
const comsumeMsg = (ch) => {
  ch.consume;
};

// RabbitMQ 연결 설정
async function sendMessage(fileUrl, inputData, mode) {
  try {
    // const queue = await getLeastLoadedQueue();

    const connection = await amqp.connect(
      `amqp://${process.env.RABBITMQ_ID}:${process.env.RABBITMQ_PWD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
    );
    const channel = await connection.createChannel();

    const uuid = uuidv4();
    let queue = await getLeastLoadedQueue("s");
    if (queue === null) {
      queue = mode === "c" ? "master1.compute_req" : "master1.save_req";
    }
    const exchange = "req_exchange";
    const routingKey = queue;
    const res_routingKey = `router.${uuid}`;
    const msg = JSON.stringify({ fileUrl, res_routingKey });

    await channel.assertExchange(exchange, "direct", { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(msg), {
      persistent: true,
    });

    setTimeout(async () => {
      await channel.close();
      await connection.close();
    }, 500);
  } catch (e) {
    console.error(e);
  }
}

module.exports = { sendMessage };
