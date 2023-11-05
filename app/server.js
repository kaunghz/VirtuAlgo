let express = require("express");
let { Pool } = require("pg");
let bcrypt = require("bcrypt");
let env = require("../env.json");

let hostname = "localhost";
let port = 3000;

let app = express();
let pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});


app.use(express.json());
app.use(express.static("public"));
app.use(express.static("login"));
app.use(express.static("algotrade"));

let saltRounds = 10;

app.post("/signup", (req, res) => {
  let email = req.body.email;
  let username = req.body.username;
  let plaintextPassword = req.body.plaintextPassword;
  
  let validRegexPasswordCheck = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,25})/;

  if(!email ||
    !username || 
    !plaintextPassword || 
    typeof email !== "string" ||
    typeof username !== "string" || 
    typeof plaintextPassword !== "string" || 
    username.length < 1 || 
    username.length > 20 || 
    plaintextPassword.length < 8 || 
    plaintextPassword.length > 25 ||
    !validRegexPasswordCheck.test(plaintextPassword)) 
    {
      return res.status(401).send();
    }
  
  
  pool
  .query("SELECT * FROM users WHERE username = $1", [username])
  .then((result) => {
    if (result.rows.length > 0) {
      console.log(username, "already exists");
      res.status(401).send();
    } else {
      bcrypt
      .hash(plaintextPassword, saltRounds)
      .then((saltedPassword) => {
        pool
        .query("INSERT INTO users (username, saltedPass, email) VALUES ($1, $2, $3)", [username, saltedPassword, email])
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



app.post("/signin", (req, res) => {
  let username = req.body.username;
  let plaintextPassword = req.body.plaintextPassword;
  pool
    .query("SELECT saltedPass FROM users WHERE username = $1", [username])
    .then((result) => {
      if (result.rows.length === 0) {
        console.log(username, "does not exists");
        return res.status(401).send();
      }
      let saltedPassword = result.rows[0].saltedpass;
      bcrypt
        .compare(plaintextPassword, saltedPassword)
        .then((passwordMatched) => {
          if (passwordMatched) {
            console.log(username, "logged in");
            res.status(200).send();
          } else {
            console.log(username, "could not logged in");
            res.status(401).send();
          }
        })
        .catch((error) => {
          console.log("BCrypt Salt Password:", error);
          res.status(500).send();
        });
    })
    .catch((error) => {
      console.log("SQL Select From Users:", error);
      res.status(500).send();
    });
});

app.post("/new-algorithm", (req, res) => {
  let body = req.body;
  console.log(body);

  let name = body['new-algorithm-name'];
  let buyBelowPrice = parseFloat(body['buy-below-price']);
  let buyBelowStocks = parseFloat(body['buy-below-stocks']);
  let sellBelowPrice = parseFloat(body['sell-below-price']);
  let sellBelowStocks = parseFloat(body['sell-below-stocks']);
  let sellAbovePrice = parseFloat(body['sell-above-price']);
  let sellAboveStocks = parseFloat(body['sell-above-stocks']);

  pool.query(
    'INSERT INTO ALGORITHMS (userId, name, buyBelowPrice, buyBelowStocks, sellBelowPrice, sellBelowStocks, sellAbovePrice, sellAboveStocks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [1, name, buyBelowPrice, buyBelowStocks, sellBelowPrice, sellBelowStocks, sellAbovePrice, sellAboveStocks]
  );

  res.status(200).send();
});

app.get("/get-algorithms", (req, res) => {
  pool.query(
    "SELECT * FROM ALGORITHMS"
  ).then((result) => {
    let rows = result.rows;
    console.log(rows);
    res.status(200).send(rows);
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  });
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});