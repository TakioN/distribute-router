const { getLeastMasterId } = require("./getLeastMasterId");
const { insertToDb } = require("./insertToDb");
const { sendMessage } = require("./sendMessage");

async function computeFile(req, res) {
  try {
    const { file_id, input_data } = req.body;

    if (!input_data) {
      return res.status(400).json({ error: "input data가 필요합니다." });
    }

    let masterId = await getLeastMasterId();
    if (masterId === null) {
      throw new Error("No available master found");
    }
    const data = { tpye: "compute", input: input_data, model_id: file_id };
    const jobId = await insertToDb(masterId, data);
    await sendMessage(jobId, masterId, "c");

    res.json({ success: true, jobId });
  } catch (err) {
    console.error("연산 요청 실패:", err);
    res.status(500).json({ error: "연산 요청 실패" });
  }
}

module.exports = { computeFile };
