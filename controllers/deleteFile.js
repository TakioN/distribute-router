const retry = require("../dbRetry");
const { getLeastMasterId } = require("../getLeastMasterId");
const { insertToDb } = require("../insertToDb");
const { sendMessage } = require("../sendMessage");

async function deleteFile(req, res) {
  try {
    const fileId = req.file_id;
    const masterId = await retry(() => getLeastMasterId());
    const data = { type: "delete", model_id: fileId };

    const jobId = await retry(() => insertToDb(masterId, data));
    await sendMessage(jobId, masterId, "d");
    res.json({ success: true, jobId });
  } catch (e) {
    console.error("삭제 요청 실패 : ", e);
    res.status(500).json({ success: false, error: "삭제 요청 실패" });
  }
}

module.exports = deleteFile;
