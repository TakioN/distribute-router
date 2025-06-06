const mysql = require("mysql2/promise");

async function getLeastMasterId() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.execute(
    "SELECT id FROM master WHERE is_online = 1 and queue = (SELECT MIN(queue) FROM master WHERE is_online = 1)"
  );
  if (rows.length === 0) {
    throw new Error("online 상태 master 없음");
  }
  await connection.end();
  return rows[0].id;
}

module.exports = { getLeastMasterId };
