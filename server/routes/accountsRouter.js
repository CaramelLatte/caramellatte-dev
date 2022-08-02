const express = require("express");
const accountsRouter = express.Router();
//const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.SQL_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

accountsRouter.route("/login").post((req, res) => {
  data = req.body;
  //console.log(data)
  pool.query(
    'SELECT * FROM users WHERE user_username = $1', [data.username],
    (err, results) => {
      console.log(`${err}, 
      ${results}`)
      if (err) console.log(err);
      if (results.rows.length < 1) {
        console.log("Not found!");
        res.status(400).json("Account not found!");
      } else {
        let check = bcrypt.compareSync(
          data.password,
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
  let data = req.body;
  let password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  pool.query(
    `SELECT $1 FROM users WHERE user_username = $2`, [data.username, data.password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.rows.length < 1) {
        pool.query(
          `INSERT INTO users (user_username, user_password) VALUES ($1, '${hash}')`, [data.username]
        );
        res
          .status(200)
          .json(`Account created with username ${req.body.username}`);
      } else {
        res.status(400).json("Account already exists!");
      }
    }
  );
});

accountsRouter.route("/delete").delete((req, res) => {
  data = req.body
  pool.query(
    `SELECT * FROM users WHERE user_username = $1`, [data.username],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      if (results.rows.length >= 1) {
        pool.query(
          `DELETE FROM users WHERE user_username = $1`, [data.username]
        );
        res.status(200).json("Account deleted");
      }
    }
  );
});

module.exports = accountsRouter;
