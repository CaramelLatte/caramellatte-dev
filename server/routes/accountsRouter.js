const express = require("express");
const accountsRouter = express.Router();
//const fetch = require("node-fetch");

const bcrypt = require("bcryptjs");
const pass = "jared";

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("jared", salt);

console.log(`The salt is ${salt}, and the hash is ${hash}`);

let check = bcrypt.compareSync(pass, hash);
if (check === true) {
  console.log("yes");
} else {
  console.log("no");
}

module.exports = accountsRouter;
