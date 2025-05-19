const { sendMessage } = require("./sendMessage");

async function computeFile(req, res) {
  try {
    const { file_id, input_data } = req.body;

    if (!file_id || !input_data) {
      return res.status(400).json({ error: "modelId와 input이 필요합니다." });
    }

    const requestId = `${Date.now()}-${Math.random()}`; // 유니크 ID

    const payload = {
      requestId,
      type: "RUN_MODEL",
      file_id,
      input_data,
    };

    sendMessage(file_id);
    console.log(
      `[RUN 요청] 모델 ${file_id}에 input 전달, requestId: ${requestId}`
    );

    res.json({ requestId });
  } catch (err) {
    console.error("연산 요청 실패:", err);
    res.status(500).json({ error: "연산 요청 실패" });
  }
}

module.exports = { computeFile };
