const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const userController = require("./controllers/user_controller");
const purchaseController = require("./controllers/purchase_controller");

const app = express();
const port = 3000;

// corsを使うと、クロスオリジンのエラーが出なくなる
app.use(cors());
// ExpressでJSONボディを扱えるようにする
app.use(express.json());

app.use("/users", userController);
app.use("/purchase", purchaseController);


app.get("/", (req, res) => {
  res.json({ message: "Success API Server" });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
