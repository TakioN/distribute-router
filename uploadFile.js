require("dotenv").config();
const fs = require("fs");
const { google } = require("googleapis");
const { sendMessage } = require("./sendMessage");
const { insertToDb } = require("./insertToDb");
const { getLeastMasterId } = require("./getLeastMasterId");

// 정적 파일 제공 (임시 파일 접근)
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

async function uploadToDrive(filePath, fileName) {
  const fileMetadata = { name: fileName };
  const media = {
    mimeType: "application/octet-stream",
    body: fs.createReadStream(filePath),
  };
  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, size",
  });
  // 링크 공유 설정 (옵션)
  try {
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        type: "anyone",
        role: "reader",
      },
    });
  } catch (e) {
    console.log(e);
  }
  const downloadUrl = `https://drive.google.com/uc?id=${file.data.id}`;
  return {
    fileUrl: downloadUrl,
    fileSize: file.data.size,
  };
}

async function deleteDrive() {
  await drive.files.delete({
    fileId: "11qnkDXkGkIK-aLvJjo4SPdzfS_pFYpNI",
  });
  const res = await drive.files.list({
    pageSize: 10,
    fields: "files(id, name)",
  });
  console.log("서비스 계정 드라이브에 있는 파일들:", res.data.files);
}

async function uploadFile(req, res) {
  try {
    const localPath = req.file.path;
    const originalName = req.file.originalname;

    const { fileUrl, fileSize } = await uploadToDrive(localPath, originalName);
    // await deleteDrive();

    // 로컬 파일 삭제
    fs.unlinkSync(localPath);

    let masterId = await getLeastMasterId();
    if (masterId === null) {
      throw new Error("No available master found");
    }
    const data = { size: fileSize, type: "save", file_url: fileUrl };
    const jobId = await insertToDb(masterId, data);
    await sendMessage(jobId, masterId, "s");

    res.json({ success: true, jobId });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
}

module.exports = { uploadFile };
