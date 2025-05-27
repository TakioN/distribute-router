const amqp = require("amqplib");

// 메세지 소비
const comsumeMsg = (ch) => {
  ch.consume;
};

// rabbitmq 끊기 전 딜레이 유발
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// RabbitMQ 연결 설정
async function sendMessage(jobId, masterId, mode) {
  try {
    const connection = await amqp.connect(
      `amqp://${process.env.RABBITMQ_ID}:${process.env.RABBITMQ_PWD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
    );
    const channel = await connection.createChannel();

    // RabbitMQ 교환기 name
    const exchange = mode === "c" ? "compute" : "save";
    // RabbitMQ 라우팅 키
    const routingKey =
      mode === "c"
        ? `master${masterId}.compute.req`
        : `master${masterId}.save.req`;
    const msg = JSON.stringify({ job_id: jobId });

    // 교환기 생성
    await channel.assertExchange(exchange, "direct", { durable: true });

    // 메세지 발행
    console.log("eb : ", exchange);
    console.log("rb : ", routingKey);
    const temp = channel.publish(exchange, routingKey, Buffer.from(msg), {
      persistent: true,
    });
    console.log("e : ", exchange);
    console.log("r : ", routingKey);

    await delay(500);
    await channel.close();
    await connection.close();
  } catch (e) {
    console.error(e);
  }
}

module.exports = { sendMessage };
