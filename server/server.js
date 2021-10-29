const path = require("path");
const express = require("express");
const app = express();
const publicPath = path.join(__dirname, "/../build/");
const port = process.env.PORT || 3000;
const logger = require("morgan");
let bp = require("body-parser");

//app.use(express.static("public"));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(express.static(publicPath));
// app.get("*", (req, res, next) => {
//   res.sendFile(path.join(publicPath, "index.html"));
// });
const accountsRouter = require("./routes/accountsRouter");
app.use("/accounts", accountsRouter);
app.use(express.static(path.join(__dirname, "/../build/")));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "/../build/", "index.html"));
});

app.listen(port, () => {
  console.log("Server is up!");
});
