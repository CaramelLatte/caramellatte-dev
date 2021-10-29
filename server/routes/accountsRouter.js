const express = require("express");
const accountsRouter = express.Router();
//const fetch = require("node-fetch");

const bcrypt = require("bcryptjs");
const pass = "jared";

// let check = bcrypt.compareSync(pass, hash);
// if (check === true) {
//   console.log("yes");
// } else {
//   console.log("no");
// }

accountsRouter.route("/").post((req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  console.log(`Username: ${username} password: ${password}`);

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  console.log(
    `The username is ${username}, and the hashed password is ${hash}`
  );

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.json(req.body);
});

module.exports = accountsRouter;
