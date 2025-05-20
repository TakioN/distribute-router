const mysql = require("mysql2/promise");

async function checkStatus(req, res) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
  });
  try {
    const { job_id } = req.body;
    let status = "";
    try {
      const [state] = await connection.query(
        "SELECT state FROM job WHERE id=?",
        [job_id]
      );
      if (state[0].state === -1) {
        status = "진행 중";
      } else if (state[0].state === 0) {
        status = "실패";
      } else {
        status = "성공";
      }

      res.json({ state: status });
    } catch (e) {
      console.error("해당 id 없음", e);
      res.status(500).json({ error: "해당 id 없음" });
    }
  } catch (e) {
    console.error("상태 확인 실패:", e);
    res.status(500).json({ error: "상태 확인 요청 실패" });
  }
}

module.exports = { checkStatus };
