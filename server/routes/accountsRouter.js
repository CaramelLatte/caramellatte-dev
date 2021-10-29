const express = require("express");
const accountsRouter = express.Router();
//const fetch = require("node-fetch");

const bcrypt = require("bcryptjs");
const { Pool, Client } = require("pg");
const { response } = require("express");

const pool = new Pool({
  user: "nutdvvdgsxgsvk",
  host: "ec2-18-234-15-247.compute-1.amazonaws.com",
  database: "d1e9hugahp0n5r",
  password: "7dc25c1edf0bd77382375842b0eae11de5d83303f61323a523169cc9e93f9b7b",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

accountsRouter
  .route("/")
  .get((req, res) => {
    pool.query("SELECT * FROM users", (err, results) => {
      if (err) console.log(err);
      console.log(results.rows);
      if (req.body.username === results.rows[0].user_username) {
        res.status(200).json("Account match!");
      } else {
        res.status(200).json("Account not found");
      }
      let check = bcrypt.compareSync(
        req.body.password,
        results.rows[0].user_password
      );
      if (check === true) {
        console.log("yes");
      } else {
        console.log("no");
      }
    });
  })
  .post((req, res) => {
    let password = req.body.password;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    pool.query(
      `INSERT INTO users (user_username, user_password) VALUES ('${req.body.username}', '${hash}')`
    );

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.json(req.body);
  });

module.exports = accountsRouter;
