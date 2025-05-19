const { getLeastLoadedQueue } = require("./getLeastQueue");
// const amqp = require("amqplib/callback_api");
const amqp = require("amqplib/callback-api");
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

    amqp.connect(
      `amqp://${process.env.RABBITMQ_ID}:${process.env.RABBITMQ_PWD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      (err, conn) => {
        if (err) {
          console.error("AMQP Connection error:", err);
          return;
        }

        conn.createChannel(async (err, ch) => {
          if (err) {
            console.error("[AMQP] Channel creation error:", err);
            return;
          }

          const uuid = uuidv4();
          let queue = await getLeastLoadedQueue("s");
          if (queue === null) {
            queue = mode === "c" ? "master1.compute_req" : "master1.save_req";
          }
          const exchange = "req_exchange";
          const routingKey = queue;
          const res_routingKey = `router.${uuid}`;
          const msg = JSON.stringify({ fileUrl, res_routingKey });

          console.log(queue);

          // ch.assertExchange(exchange, "direct", { durable: true });

          ch.assertExchange(
            exchange,
            "direct",
            { durable: true },
            (err, ok) => {
              if (err) {
                console.error("Exchange assert error:", err);
                return;
              }

              ch.assertQueue(queue, { durable: true }, (err, ok) => {
                ch.bindQueue(queue, exchange, routingKey, {}, () => {
                  publishMsg(ch, exchange, routingKey, msg);
                  consumeMsg();
                });
              });
            }
          );

          //   const queue = "save_req";

          //   ch.assertQueue(queue, { durable: true });
          //   ch.sendToQueue(queue, Buffer.from(msg), { persistent: true });

          //   console.log("[SEND] File URL and Request ID sent to queue:", msg);
        });

        setTimeout(() => {
          conn.close();
        }, 500);
      }
    );
  } catch (e) {
    console.error(e);
  }
}

module.exports = { sendMessage };
