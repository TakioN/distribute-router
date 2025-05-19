const axios = require("axios");

// 가장 한가한 큐 찾기
async function getLeastLoadedQueue(mode) {
  const q_name = mode === "c" ? "compute_req" : "save_req";
  const response = await axios.get("http://localhost:15672/api/queues", {
    auth: {
      username: process.env.RABBITMQ_ID,
      password: process.env.RABBITMQ_PWD,
    },
  });

  const queues = response.data.filter((q) => q.name.includes(q_name));
  queues.sort((a, b) => a.messages - b.messages);

  // queue 목록 없으면 null 리턴
  return queues.length > 0 ? queues[0].name : null;
}

module.exports = { getLeastLoadedQueue };
