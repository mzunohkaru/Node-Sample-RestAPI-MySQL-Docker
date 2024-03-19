const router = require("express").Router();
const mysql = require("mysql2");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { pool, SECRET_KEY } = require("../utils/constants");

// CREATE ユーザーを作成する
router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const isActive = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // メールアドレスが既に存在するかどうかをチェック
    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.error("データベースエラー:", error);
          return res
            .status(500)
            .json({ error: "データベースエラーが発生しました。" });
        }
        if (results.length > 0) {
          return res
            .status(400)
            .json({ error: "このメールアドレスは既に使用されています。" });
        }

        // ユーザーをデータベースに挿入
        pool.query(
          "INSERT INTO users (email, password, isActive) VALUES (?, ?, ?)",
          [email, hashedPassword, isActive],
          (error, results) => {
            if (error) {
              console.error(
                "データベースへの挿入中にエラーが発生しました:",
                error
              );
              return res.status(500).json({
                error:
                  "データベースへのデータ挿入時にサーバーエラーが発生しました。",
              });
            }
            // JWTの発行
            const token = JWT.sign(
              {
                email,
              },
              SECRET_KEY,
              {
                expiresIn: "1h",
              }
            );

            res.status(201).json({
              msg: "トークンを発行しました",
              email: email,
              password: hashedPassword,
              isActive: isActive,
              token: token,
            });
          }
        );
      }
    );
  }
);

// READ ログイン
router.get("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.error("データベースエラー:", error);
        res.status(500).json({ error: "データベースエラーが発生しました。" });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({
          error: "メールアドレスに一致するユーザーが見つかりません。",
        });
        return;
      }
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ error: "パスワードが一致しません。" });
        return;
      }
      const token = JWT.sign(
        {
          id: user.id,
          email: user.email,
        },
        SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.json({ msg: "ログインに成功しました。", token: token });
    }
  );
});

// READ ユーザー一覧を取得する
router.get("/", (req, res) => {
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
});

// READ ユーザーを取得する
router.get("/:id", (req, res) => {
  const { id } = req.params;
  pool.query("SELECT * FROM users WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("データベースエラー:", error);
      res.status(500).json({ error: "データベースエラーが発生しました。" });
      return;
    }
    if (results.length === 0) {
      res
        .status(404)
        .json({ error: "指定されたIDのユーザーが見つかりません。" });
      return;
    }
    res.json(results[0]);
  });
});

// PUT ユーザー情報 (isActive) を更新する
router.put("/active/:id", (req, res) => {
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
});

// PUT ユーザー情報 (email) を更新する
router.put("/email/:id", (req, res) => {
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
});

// DELETE ユーザーを削除する
router.delete("/:id", (req, res) => {
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
});

module.exports = router;
