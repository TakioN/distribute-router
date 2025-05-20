const mysql = require("mysql2/promise");

async function insertToDb(masterId, data) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
  });

  const [jobInfo] = await connection.query(
    "INSERT INTO job (state, master, data) VALUES (?, ?, ?)",
    [-1, JSON.stringify({ master: masterId }), JSON.stringify(data)]
  );

  return jobInfo.insertId;
}

module.exports = { insertToDb };
