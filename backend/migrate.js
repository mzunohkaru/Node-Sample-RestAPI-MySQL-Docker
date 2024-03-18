const mysql = require("mysql2");

// MySQLデータベースへの接続設定
const connection = mysql.createConnection({
  host: "db", // Dockerで設定したMySQLのホスト
  user: "user", // MySQLのユーザー名
  password: "password", // MySQLのパスワード
  database: "dev", // 接続するデータベース名
});

// ユーザー情報を管理するusersテーブルを作成する
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isActive BOOL NOT NULL DEFAULT FALSE
)`;

// 購入情報を管理するpurchasesテーブルを作成する
const createPurchasesTable = `
CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`;

// usersテーブルを作成する
connection.query(createUsersTable, function (err, results, fields) {
  if (err) {
    console.error("usersテーブルの作成に失敗しました。", err);
    return;
  }
  console.log("usersテーブルを作成しました。");
});

// purchasesテーブルを作成する
connection.query(createPurchasesTable, function (err, results, fields) {
  if (err) {
    console.error("purchasesテーブルの作成に失敗しました。", err);
    return;
  }
  console.log("purchasesテーブルを作成しました。");
});

connection.end();

