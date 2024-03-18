const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const userController = require("./controllers/userController");
const purchaseController = require("./controllers/purchaseController");

const app = express();
const port = 3000;

// MySQLデータベースへの接続設定
const pool = mysql.createPool({
  host: "db", // Dockerで設定したMySQLのホスト
  user: "user", // MySQLのユーザー名
  password: "password", // MySQLのパスワード
  database: "dev", // 接続するデータベース名
  port: 3306, // MySQLのデフォルトポート
});

// corsを使うと、クロスオリジンのエラーが出なくなる
app.use(cors());
// ExpressでJSONボディを扱えるようにする
app.use(express.json());

app.use("/purchase", purchaseController);

// ユーザーを作成する（Create）
app.post("/users", userController.createUser);

// ユーザー一覧を取得する（Read）
app.get("/users", userController.readUser);

// ユーザー情報 (isActive) を更新する（Update）
app.put("/users/active/:id", userController.updateActive);

// ユーザー情報 (email) を更新する（Update）
app.put("/users/email/:id", userController.updateEmail);

// ユーザーを削除する（Delete）
app.delete("/users/:id", userController.deleteUser);

app.get("/", (req, res) => {
  res.json({ message: "Success API Server" });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
