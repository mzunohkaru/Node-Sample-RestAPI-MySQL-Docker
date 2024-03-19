const mysql = require("mysql2");

const SECRET_KEY = "43a1fb6710b62a522f7b628356cc3ae26d4143793c29bb1c0158112ad4ba5327";

// MySQLデータベースへの接続設定
const pool = mysql.createPool({
  host: "db",
  user: "user",
  password: "password",
  database: "dev",
  port: 3306,
});

module.exports = { pool, SECRET_KEY };
