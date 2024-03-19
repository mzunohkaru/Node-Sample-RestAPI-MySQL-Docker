const router = require("express").Router();
const mysql = require("mysql2");
const { pool } = require("../utils/constants");
const check_jwt = require("../middleware/check_jwt");

router.post("/:id", (req, res) => {
  const user_id = req.params.id;
  const { product } = req.body;
  if (!user_id || !product) {
    res.status(400).json({ error: "必要な情報が提供されていません。" });
    return;
  }
  pool.query(
    "SELECT id FROM users WHERE id = ?",
    [user_id],
    (error, results) => {
      if (error) {
        console.error("ユーザー検証中にエラーが発生しました:", error);
        res.status(500).json({
          error: "ユーザー検証時にサーバーエラーが発生しました。",
        });
        return;
      }
      if (results.length > 0) {
        pool.query(
          "INSERT INTO purchases (user_id, product) VALUES (?, ?)",
          [user_id, product],
          (error, insertResults) => {
            if (error) {
              console.error("購入情報の挿入中にエラーが発生しました:", error);
              res.status(500).json({
                error:
                  "データベースへのデータ挿入時にサーバーエラーが発生しました。",
              });
              return;
            }
            res.status(201).json({
              id: insertResults.insertId,
              user_id: user_id,
              product,
            });
          }
        );
      } else {
        res.status(404).json({ error: "指定されたユーザーIDは存在しません。" });
      }
    }
  );
});

router.get("/", check_jwt, (req, res) => {
  pool.query("SELECT * FROM purchases", (error, results) => {
    if (error) {
      console.error("購入情報の取得中にエラーが発生しました:", error);
      res.status(500).json({
        error:
          "データベースからの購入情報取得時にサーバーエラーが発生しました。",
      });
      return;
    }
    res.json(results);
  });
});

module.exports = router;
