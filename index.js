require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { google } = require("googleapis");
const { uploadFile } = require("./uploadFile");
const { computeFile } = require("./computeFile");

const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

// 파일 로컬 업로드
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// upload
app.post("/upload", upload.single("file"), uploadFile);

// compute
app.post("/compute", computeFile);

// 서버 시작
app.listen(PORT, () => {
  console.log(`📡 API Gateway running at http://localhost:${PORT}`);
});
