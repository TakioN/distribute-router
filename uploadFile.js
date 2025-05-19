require("dotenv").config();
const fs = require("fs");
const { google } = require("googleapis");
const { sendMessage } = require("./sendMessage");

// async function uploadFile(req, res) {
//   const file = req.file;
//   const requestId = uuidv4(); // file ID
//   const fileUrl = `http://localhost:4000/temp/${file.filename}`;
//   const responseRoutingKey = "compute.response.router1";

//   sendToQueue(fileUrl, responseRoutingKey);

//   try {
//     // 마스터에 요청 전송
//     await axios.post("http://<MASTER-HOST>:<Master-port>/handle-request", {
//       requestId,
//       fileUrl,
//     });

//     res.json({ requestId });
//   } catch (err) {
//     console.error("마스터 전송 실패:", err.message);
//     res.status(500).json({ error: "마스터 전송 실패" });
//   }
// }

// 정적 파일 제공 (임시 파일 접근)
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

async function uploadToDrive(filePath, fileName) {
  //   await drive.files.delete({
  //     fileId: "1021xH5KTfzlEVdhuuMWsbmxMI9e6KCu5",
  //   });
  //   const res = await drive.files.list({
  //     pageSize: 10,
  //     fields: "files(id, name)",
  //   });
  //   console.log("서비스 계정 드라이브에 있는 파일들:", res.data.files);

  const fileMetadata = { name: fileName };
  const media = {
    mimeType: "application/octet-stream",
    body: fs.createReadStream(filePath),
  };
  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
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
  const downloadUrl = `https://drive.google.com/uc?id=${file.data.id}&export=download`;
  console.log(file.data.id);
  return { fileId: file.data.id, downloadUrl };
}

async function uploadFile(req, res) {
  try {
    const localPath = req.file.path;
    const originalName = req.file.originalname;

    // const { fileId, downloadUrl } = await uploadToDrive(
    //   localPath,
    //   originalName
    // );

    // 로컬 파일 삭제
    fs.unlinkSync(localPath);

    // sendMessage(downloadUrl, null, "s");
    sendMessage("ss", null, "s");

    // res.json({ success: true, fileId, downloadUrl });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
}

module.exports = { uploadFile };
