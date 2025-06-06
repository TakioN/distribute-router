const mysql = require("mysql2/promise");

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
  });

  return connection;
}

async function getResult(job_id, connection) {
  try {
    const [rows] = await connection.query("SELECT result FROM job WHERE id=?", [
      job_id,
    ]);
    const result = rows[0]?.result; // {result: 51511}
    console.log(result.result);
    return result.result;
  } catch (e) {
    console.error("결과값 가져오기 실패" + e);
  }
}

async function checkResult(req, res) {
  let connection;
  try {
    connection = await initDB();
  } catch (e) {
    console.error("DB 연결 실패");
  }

  try {
    const { job_id } = req.body;
    let status = "";
    let result = 0;
    try {
      const [state] = await connection.query(
        "SELECT state FROM job WHERE id=?",
        [job_id]
      );
      if (state[0].state === -1) {
        status = "진행 중";
      } else if (state[0].state === 0) {
        status = "실패";
      } else if (state[0].state === 1) {
        status = "성공";
        result = await getResult(job_id, connection);
        console.log(result);
      }

      res.json({ state: status, result });
    } catch (e) {
      console.error("해당 id 없음", e);
      res.status(500).json({ state: "해당 id 없음" });
    }
  } catch (e) {
    console.error("상태 확인 실패:", e);
    res.status(500).json({ error: "상태 확인 요청 실패" });
  }
}

module.exports = { checkResult };
