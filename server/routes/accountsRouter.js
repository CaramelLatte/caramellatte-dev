const express = require("express");
const accountsRouter = express.Router();
//const fetch = require("node-fetch");

const bcrypt = require("bcryptjs");
const { Pool, Client } = require("pg");
const { response } = require("express");

const aws = require("aws-sdk");

let s3 = new aws.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  user: process.env.S3_USER,
  host: process.env.S3_HOST,
  database: process.env.S3_DATABASE,
  password: process.env.S3_PASSWORD,
  port: process.env.S3_PORT,
});

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
accountsRouter.route("/login").post((req, res) => {
  pool.query(
    `SELECT * FROM users WHERE user_username = '${req.body.username}'`,
    (err, results) => {
      if (err) console.log(err);
      if (results.rows.length < 1) {
        console.log("Not found!");
        res.status(400).json("Account not found!");
      } else {
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
});

accountsRouter.route("/register").post((req, res) => {
  let password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  pool.query(
    `SELECT * FROM users WHERE user_username = '${req.body.username}'`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.rows.length < 1) {
        pool.query(
          `INSERT INTO users (user_username, user_password) VALUES ('${req.body.username}', '${hash}')`
        );
        res
          .status(200)
          .json(`Account created with username ${req.body.username}`);
      } else {
        res.status(400).json("Account already exists!");
        console.log("Account exists");
      }
    }
  );
});

accountsRouter.route("/delete").delete((req, res) => {
  pool.query(
    `SELECT * FROM users WHERE user_username = '${req.body.username}'`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      if (results.rows.length >= 1) {
        pool.query(
          `DELETE FROM users WHERE user_username = '${req.body.username}'`
        );
        res.status(200).json("Account deleted");
      }
    }
  );
});

module.exports = accountsRouter;
