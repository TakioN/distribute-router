const { getLeastMasterId } = require("./getLeastMasterId");
const { insertToDb } = require("./insertToDb");
const { sendMessage } = require("./sendMessage");

async function computeFile(req, res) {
  try {
    const { file_id, input_data } = req.body;

    if (!input_data) {
      return res.status(400).json({ error: "input data가 필요합니다." });
    }

    const masterId = await retry(() => getLeastMasterId());
    const data = { type: "compute", input: input_data, model_id: file_id };

    const jobId = await retry(() => insertToDb(masterId, data));
    await sendMessage(jobId, masterId, "c");

    res.json({ success: true, jobId });
  } catch (err) {
    console.error("연산 요청 실패:", err);
    res.status(500).json({ success: false, error: "연산 요청 실패" });
  }
}

async function retry(func) {
  for (let i = 1; i > 0; i++) {
    try {
      return await func();
    } catch (e) {
      console.error(e);
      const isRetryable =
        e.message.includes("ECONNREFUSED") ||
        e.message.includes("ETIMEDOUT") ||
        e.message.includes("Connection lost") ||
        e.code === "PROTOCOL_CONNECTION_LOST";

      if (!isRetryable) {
        console.error("조치 필요");
        throw e;
      }
      const delay = i < 4 ? 1000 * Math.pow(2, i) : 10000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

module.exports = { computeFile };
