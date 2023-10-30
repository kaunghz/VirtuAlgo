const pg = require("pg");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());

let saltRounds = 10;
app.post("/signup", (req, res) => {
  let username = req.body.username;
  let plaintextPassword = req.body.plaintextPassword;

  pool
  .query("SELECT * FROM users WHERE username = $1", [username])
  .then((result) => {
    if (result.rows.length > 0) {
      res.status(401).send();
    } else {
      bcrypt
      .hash(plaintextPassword, saltRounds)
      .then((saltedPassword) => {
        pool
        .query("INSERT INTO users (username, saltedPass) VALUES ($1, $2)", [username, saltedPassword])
        .then(() => {
          console.log(username, "account created");
          res.status(200).send();
        })
        .catch((error) => {
          console.log("SQL Insert Into Users:", error);
          res.status(500).send();
        });
      })
      .catch((error) => {
        console.log("BCrypt Salt Password:", error);
        res.status(500).send();
      });
    }
  })
  .catch((error) => {
    console.log("SQL Select From Users:", error);
    res.status(500).send();
  });
});

/*
Add code
*/

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
