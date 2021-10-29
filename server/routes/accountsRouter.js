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
  .post((req, res) => {
    pool.query(
      `SELECT * FROM users WHERE user_username = '${req.body.username}'`,
      (err, results) => {
        if (err) console.log(err);
        if (results.rows.length < 1) {
          console.log("Not found!");
          res.status(400).json("Account not found!");
        } else {
          // res.status(200).json("Accou  nt match!");
          let check = bcrypt.compareSync(
            req.body.password,
            results.rows[0].user_password
          );
          if (check === true) {
            res.status(200).json(`${req.body.username}`);
          } else {
            res.status(400).json("Wrong password");
          }
        }
      }
    );
  })
  .put((req, res) => {
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
