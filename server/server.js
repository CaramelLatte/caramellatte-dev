const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const publicPath = path.join(__dirname, "/../build/");
const port = process.env.PORT || 5000;
let bp = require("body-parser");

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Proxy /api to the ticketing sim on port 5001
app.use(createProxyMiddleware({
  target: "http://127.0.0.1:5001",
  changeOrigin: true,
  pathFilter: "/api",
}));

app.use(express.static(publicPath));

// const accountsRouter = require("./routes/accountsRouter");
// app.use("/accounts", accountsRouter);

app.use(express.static(path.join(__dirname, "/../build/")));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "/../build/", "index.html"));
});

app.listen(port, () => {
  console.log("Server is up!");
});
