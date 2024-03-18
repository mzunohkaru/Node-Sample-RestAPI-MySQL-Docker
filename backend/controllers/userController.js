const mysql = require("mysql2");

// MySQLデータベースへの接続設定
const pool = mysql.createPool({
  host: "db",
  user: "user",
  password: "password",
  database: "dev",
  port: 3306,
});

exports.createUser = (req, res) => {
  const { email, password } = req.body;
  const isActive = false;
  pool.query(
    "INSERT INTO users (email, password, isActive) VALUES (?, ?, ?)",
    [email, password, isActive],
    (error, results) => {
      if (error) {
        console.error("データベースへの挿入中にエラーが発生しました:", error);
        res.status(500).json({
          error: "データベースへのデータ挿入時にサーバーエラーが発生しました。",
        });
        return;
      }
      res.status(201).json({ id: results.insertId, email, password, isActive });
    }
  );
};

exports.readUser = (req, res) => {
  pool.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error(
        "データベースからの読み込み中にエラーが発生しました:",
        error
      );
      res.status(500).json({
        error: "データベースからのデータ取得時にサーバーエラーが発生しました。",
      });
      return;
    }
    res.json(results);
  });
};

exports.updateActive = (req, res) => {
  const { id } = req.params;
  pool.query(
    "UPDATE users SET isActive = NOT isActive WHERE id = ?",
    [id],
    (error, results) => {
      if (error) {
        console.error("ユーザー情報の更新中にエラーが発生しました:", error);
        res.status(500).json({
          error: "データベースの更新時にサーバーエラーが発生しました。",
        });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ message: "該当するユーザーが見つかりません。" });
      } else {
        res.json({ message: "ユーザーのisActive状態が更新されました。" });
      }
    }
  );
};

exports.updateEmail = (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "メールアドレスが提供されていません。" });
    return;
  }
  pool.query(
    "UPDATE users SET email = ? WHERE id = ?",
    [email, id],
    (error, results) => {
      if (error) {
        console.error("メールアドレスの更新中にエラーが発生しました:", error);
        res.status(500).json({
          error: "データベースの更新時にサーバーエラーが発生しました。",
        });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ message: "該当するユーザーが見つかりません。" });
      } else {
        res.json({ message: "メールアドレスが正常に更新されました。" });
      }
    }
  );
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM users WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("ユーザー削除中にデータベースエラーが発生しました:", error);
      res
        .status(500)
        .json({ error: "ユーザー削除時にサーバーエラーが発生しました。" });
      return;
    }
    res.json({ message: "ユーザーが正常に削除されました。" });
  });
};

