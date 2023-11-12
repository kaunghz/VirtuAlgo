let express = require("express");
let path = require("path");
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


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './login/login.html'));
});

app.use(express.json());
app.use(express.static("login"));
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
      console.log("Invalid Credentials");
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

app.post("/add-portfolio", (req, res) => {
  let portfolioName = req.body.name;
  let username = req.body.username;

  if(!portfolioName ||
    !username ||
    typeof portfolioName !== "string" ||
    typeof username !== "string" ||
    portfolioName.length < 1 || 
    portfolioName.length > 20 || 
    username.length < 1 || 
    username.length > 20) 
    {
      console.log("Invalid username or portfolio name");
      return res.status(401).send();
    }
  

  pool
  .query("SELECT userid FROM users WHERE username = $1", [username])
  .then((result) => {
    let userid = result.rows[0].userid;
    if (result.rows.length > 0) {
      pool
      .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=($1) AND portfolioname=($2)", [result.rows[0].userid, portfolioName])
      .then((result) => {
        if (result.rows.length > 0) {
          console.log(portfolioName, "already exists");
          res.status(401).send();
        } else {
          pool
          .query("INSERT INTO portfolio (portfolioName, userId, balance) VALUES ($1, $2, $3)", [portfolioName, userid, 10000.00])
          .then(() => {
            console.log(portfolioName, "was added");
            res.status(200).send();
          })
          .catch((error) => {
            console.log("SQL Insert Into Portfolio:", error);
            res.status(500).send();
          });
        }
      })
    } else {
      console.log(username, "does not exist");
      res.status(401).send();
    }
  })
  .catch((error) => {
    console.log("SQL Select From Users:", error);
    res.status(500).send();
  });
});



app.post("/update-portfolio", (req, res) => {
  let portfolioName = req.body.name;
  let username = req.body.username;
  let balance = req.body.balance;

  if(!portfolioName ||
    !username ||
    typeof portfolioName !== "string" ||
    typeof username !== "string" ||
    typeof balance !== "number" ||
    portfolioName.length < 1 || 
    portfolioName.length > 20 || 
    username.length < 1 || 
    username.length > 20 ||
    balance < 0 || 
    balance > 10000000.00) 
    {
      console.log("Invalid username or portfolio name");
      return res.status(401).send();
    }
  

  pool
  .query("SELECT userid FROM users WHERE username = $1", [username])
  .then((result) => {
    if (result.rows.length > 0) {
      pool
      .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=($1) AND portfolioname=($2)", [result.rows[0].userid, portfolioName])
      .then(() => {
        if (result.rows.length > 0) {
          pool
          .query("UPDATE portfolio SET balance=($2) WHERE portfolioid=($1)", [result.rows[0].portfolioid, balance])
          .then(() => {
            console.log(portfolioName, "was updated");
            res.status(200).send();
          })
          .catch((error) => {
            console.log("SQL Update Portfolio:", error);
            res.status(500).send();
          });
        } else {
          console.log(portfolioName, "already exists");
          res.status(401).send();
        }
      })
      .catch((error) => {
        console.log("SQL Update Portfolio:", error);
        res.status(500).send();
      });
    } else {
      console.log(portfolioName, "already exists");
      res.status(401).send();
    }
  })
  .catch((error) => {
    console.log("SQL Select From Users:", error);
    res.status(500).send();
  });
});



app.post("/add-stock", (req, res) => {
  let stockName = req.body.name;
  let stockPrice = req.body.price;

  try {
    stockPrice = parseFloat(stockPrice.toFixed(2));
  } catch (error) {
    console.log("Price is not formatted correctly");
    return res.status(401).send();
  }

  if(!stockName ||
    !stockPrice ||
    typeof stockName !== "string" ||
    typeof stockPrice !== "number" ||
    stockName.length < 1 || 
    stockName.length > 5 || 
    stockPrice < 0 || 
    stockPrice > 10000000.00) 
    {
      console.log("Invalid stock");
      return res.status(401).send();
    }
  

  pool
  .query("SELECT * FROM stock WHERE stockName = $1", [stockName])
  .then((result) => {
    if (result.rows.length > 0) {
      console.log(stockName, "already exists");
      res.status(401).send();
    } else {
      pool
      .query("INSERT INTO stock (stockName, stockPrice) VALUES ($1, $2)", [stockName, stockPrice])
      .then(() => {
        console.log(stockName, "was added");
        res.status(200).send();
      })
      .catch((error) => {
        console.log("SQL Insert Into Stock:", error);
        res.status(500).send();
      });
    }
  })
  .catch((error) => {
    console.log("SQL Select From Stock:", error);
    res.status(500).send();
  });
});



app.post("/update-stock", (req, res) => {
  let stockName = req.body.name;
  let stockPrice = req.body.price;

  try {
    stockPrice = parseFloat(stockPrice.toFixed(2));
  } catch (error) {
    console.log("Price is not formatted correctly");
    return res.status(401).send();
  }

  if(!stockName ||
    !stockPrice ||
    typeof stockName !== "string" ||
    typeof stockPrice !== "number" ||
    stockName.length < 1 || 
    stockName.length > 5 || 
    stockPrice < 0 || 
    stockPrice > 10000000.00) 
    {
      console.log("Invalid stock");
      return res.status(401).send();
    }
  

  pool
  .query("SELECT * FROM stock WHERE stockName = $1", [stockName])
  .then((result) => {
    if (result.rows.length > 0) {
      pool
      .query("UPDATE stock SET stockprice=($2) WHERE stockname=($1)", [stockName, stockPrice])
      .then(() => {
        console.log(stockName, "was updated");
        res.status(200).send();
      })
      .catch((error) => {
        console.log("SQL Update Stock:", error);
        res.status(500).send();
      });
    } else {
      console.log(stockName, "does not exist");
      res.status(401).send();
    }
  })
  .catch((error) => {
    console.log("SQL Select From Stock:", error);
    res.status(500).send();
  });
});

// APLACA

const Alpaca = require('@alpacahq/alpaca-trade-api');
const alpaca = new Alpaca({
  keyId: env.alpaca_key,
  secretKey: env.alpaca_secret,
  paper: true,
});

app.get('/alpaca/market/:ticker', async (req, res) => {
  let ticker = req.params.ticker;

  const bars = alpaca.getBarsV2(ticker, {
    start: "2022-04-01",
    end: "2022-04-02",
    timeframe: alpaca.newTimeframe(10, alpaca.timeframeUnit.MIN),
    limit: 55,
  });
  const got = [];
  for await (let b of bars) {
    got.push(b);
  }
  console.log(got);
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});