const path = require("path");
const express = require("express");
const app = express();
const publicPath = path.join(__dirname, "/../build/");
const port = process.env.PORT || 3000;
const logger = require("morgan");

//app.use(express.static("public"));

app.use(express.static(publicPath));
// app.get("*", (req, res, next) => {
//   res.sendFile(path.join(publicPath, "index.html"));
// });
app.use(express.static(path.join(__dirname, "/../build/")));

app.use((req, res, next) => {
  console.log("test");
  res.sendFile(path.join(__dirname, "/../build/", "index.html"));
});

app.listen(port, () => {
  console.log("Server is up!");
});
