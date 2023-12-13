const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");
let env = require("../env.json");

let hostname = "0.0.0.0";
let port = 3000;

let app = express();
// let pool = new Pool(env);
let pool = new Pool({ connectionString: process.env.DATABASE_URL });
console.log(process.env.DATABASE_URL, " database  --------------------")

pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './login/login.html'));
});

app.use(express.json());
app.use(express.static("login"));
app.use(express.static("public"));
// app.use(express.static("login"));
app.use(express.static("pics"));
app.use(express.static("algotrade"));
app.use(express.static("portfolio"));
app.use(express.static("history"));

// Use session middleware
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: false,
}))

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
          pool
          .query("SELECT userID FROM users WHERE username = $1", [username])
          .then((result) => {
            if (result.rows.length === 0) {
              console.log(username, "does not exists");
              return res.status(401).send();
            }
            let userID = result.rows[0].userid;
            req.session.user_id = userID;
            req.session.username = username;
            req.session.authenticated = true;
            
            let portfolioName = "default_port_name";
            pool
            .query("INSERT INTO portfolio (portfolioName, userId, balance) VALUES ($1, $2, $3)", [portfolioName, userID, 10000.00])
            .then(() => {
              console.log(portfolioName, "was added");
              req.session.portfolio_name = portfolioName;
              res.status(200).send();
            })
            .catch((error) => {
              console.log("SQL Insert Into Portfolio:", error);
              res.status(500).send();
            });

          })
          .catch((error) => {
            console.log("SQL Select From Users:", error);
            res.status(500).send();
          });
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
    .query("SELECT users.userID, saltedPass, portfolioname FROM users JOIN portfolio ON users.userid=portfolio.userid WHERE username = $1", [username])
    .then((result) => {
      if (result.rows.length === 0) {
        console.log(username, "does not exists");
        return res.status(401).send();
      }

      let userID = result.rows[0].userid;
      let saltedPassword = result.rows[0].saltedpass;
      let portfolioName = result.rows[0].portfolioname;

      bcrypt
        .compare(plaintextPassword, saltedPassword)
        .then((passwordMatched) => {
          if (passwordMatched) {
            console.log(username, "logged in");
            req.session.user_id = userID;
            req.session.username = username;
            req.session.authenticated = true;
            req.session.portfolio_name = portfolioName;
     
            res.status(200).send();
          } else {
            console.log("Invalid Password for user: ", username);
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
  console.log(req.session);
  let name = body['new-algorithm-name'];
  let buyBelowPrice = parseFloat(body['buy-below-price']);
  let buyBelowStocks = parseFloat(body['buy-below-stocks']);
  let sellBelowPrice = parseFloat(body['sell-below-price']);
  let sellBelowStocks = parseFloat(body['sell-below-stocks']);
  let sellAbovePrice = parseFloat(body['sell-above-price']);
  let sellAboveStocks = parseFloat(body['sell-above-stocks']);

  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;

  pool.query(
    'INSERT INTO ALGORITHMS (userId, name, buyBelowPrice, buyBelowStocks, sellBelowPrice, sellBelowStocks, sellAbovePrice, sellAboveStocks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [userID, name, buyBelowPrice, buyBelowStocks, sellBelowPrice, sellBelowStocks, sellAbovePrice, sellAboveStocks]
  );

  res.status(200).send();
});

app.get("/algorithm/get/buy-below", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM Algorithm_Buy_Below WHERE userid = $1", [userID]
  ).then((result) => {
    let rows = result.rows;
    console.log(rows);
    res.status(200).send(rows);
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  });
});

app.get("/algorithm/get/sell-above", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM Algorithm_Sell_Above WHERE userid = $1", [userID]
  ).then((result) => {
    let rows = result.rows;
    console.log(rows);
    res.status(200).send(rows);
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  });
});

app.get("/algorithm/get/sell-below", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM Algorithm_Sell_Below WHERE userid = $1", [userID]
  ).then((result) => {
    let rows = result.rows;
    console.log(rows);
    res.status(200).send(rows);
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  });
});

app.post("/algorithm/new/buy-below", (req, res) => {
  const body = req.body;

  const name = body['name'];
  const quantity = body['quantity'];
  const ticker = body['ticker'];
  const price = body['price'];

  const userID = req.session.user_id;

  pool.query(
    'INSERT INTO Algorithm_Buy_Below (userId, name, ticker, buyBelowPrice, buyBelowQuantity) VALUES ($1, $2, $3, $4, $5)',
    [userID, name, ticker, price, quantity]
  ).then(response => {
    res.status(200).send(response);
  }).catch(error => {
    console.log(error);
    res.status(500).send(error);
  });
});

app.post("/algorithm/new/sell-above", (req, res) => {
  const body = req.body;

  const name = body['name'];
  const quantity = body['quantity'];
  const ticker = body['ticker'];
  const price = body['price'];

  const userID = req.session.user_id;

  pool.query(
    'INSERT INTO Algorithm_Sell_Above (userId, name, ticker, sellAbovePrice, sellAboveQuantity) VALUES ($1, $2, $3, $4, $5)',
    [userID, name, ticker, price, quantity]
  ).then(response => {
    res.status(200).send(response);
  }).catch(error => {
    console.log(error);
    res.status(500).send(error);
  });
});

app.post("/algorithm/new/sell-below", (req, res) => {
  const body = req.body;

  const name = body['name'];
  const quantity = body['quantity'];
  const ticker = body['ticker'];
  const price = body['price'];

  const userID = req.session.user_id;

  pool.query(
    'INSERT INTO Algorithm_Sell_Below (userId, name, ticker, sellBelowPrice, sellBelowQuantity) VALUES ($1, $2, $3, $4, $5)',
    [userID, name, ticker, price, quantity]
  ).then(response => {
    res.status(200).send(response);
  }).catch(error => {
    console.log(error);
    res.status(500).send(error);
  });
});

app.get("/balance", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT balance FROM (SELECT * FROM portfolio WHERE userId = $1)",
    [userID]
  ).then((result) => {
    console.log(result.rows[0].balance);
    res.status(200).json(result.rows[0].balance);
  });
});

app.get("/portfolio/stocks", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1)",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/stocks/sort/price-desc", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) \
    ORDER BY totalprice DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/stocks/sort/price-asc", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) \
    ORDER BY totalprice ASC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/stocks/sort/alphabetical-desc", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) \
    ORDER BY stockname DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/stocks/sort/alphabetical-asc", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) \
    ORDER BY stockname ASC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/stocks/sort/amount-desc", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) \
    ORDER BY stockamount DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/stocks/sort/amount-asc", (req, res) => {
  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_stock WHERE portfolio_stock.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) \
    ORDER BY stockamount ASC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/oldest", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY portfolio_history.transactiondate ASC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/sort/price-desc", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY stockprice DESC, portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/sort/price-asc", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY stockprice ASC, portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/sort/alphabetical-desc", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY stockname DESC, portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/sort/alphabetical-asc", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY stockname ASC, portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/sort/amount-desc", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY stockamount DESC, portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history/sort/amount-asc", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) ORDER BY stockname ASC, portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/portfolio/history-buy", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) AND stockamount > 0 \
    ORDER BY portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});


app.get("/portfolio/history-sell", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT * FROM portfolio_history WHERE portfolio_history.portfolioId = (SELECT portfolioId FROM portfolio WHERE userId = $1) AND stockamount < 0 \
    ORDER BY portfolio_history.transactiondate DESC",
    [userID]
  ).then((result) => {
    res.status(200).json(result.rows);
  }).catch((err) => {
    console.log(err);
  });
});


app.post("/add-portfolio", (req, res) => {
  let portfolioName = req.body.portfolioName;

  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;

  if(!portfolioName ||
    typeof portfolioName !== "string" ||
    portfolioName.length < 1 ||
    portfolioName.length > 20)
    {
      console.log("Invalid portfolio name");
      return res.status(401).send();
    }

  pool
  .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2", [userID, portfolioName])
  .then((result) => {
    if (result.rows.length > 0) {
      console.log(portfolioName, "already exists");
      res.status(401).send();
    } else {
      pool
      .query("INSERT INTO portfolio (portfolioName, userId, balance) VALUES ($1, $2, $3)", [portfolioName, userID, 10000.00])
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
});


app.post("/update-portfolio", (req, res) => {
  let portfolioName = req.session.portfolio_name;
  let balance = parseFloat(req.body.balance);

  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;

  if(!portfolioName ||
    typeof portfolioName !== "string" ||
    typeof balance !== "number" ||
    portfolioName.length < 1 ||
    portfolioName.length > 20 ||
    balance < 0 ||
    balance > 10000000.00)
    {
      console.log("Invalid portfolio name or balance");
      return res.status(401).send();
    }

  pool
  .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2", [userID, portfolioName])
  .then((result) => {
    if (result.rows.length > 0) {
      pool
      .query("UPDATE portfolio SET balance=$3 WHERE portfolioid=( \
        SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2)", 
        [userID, portfolioName, balance])
      .then(() => {
        console.log(portfolioName, "was updated");
        res.status(200).send();
      })
      .catch((error) => {
        console.log("SQL Update Portfolio:", error);
        res.status(500).send();
      });
    } else {
      console.log(portfolioName, "does not exists");
      res.status(401).send();
    }
  })
  .catch((error) => {
    console.log("SQL Update Portfolio:", error);
    res.status(500).send();
  });
});

app.post("/update-portfolio-name", (req, res) => {
  let newPortfolioName = req.body.newPortfolioName;

  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;

  if(!newPortfolioName ||
    typeof newPortfolioName !== "string" ||
    newPortfolioName.length < 1 ||
    newPortfolioName.length > 20)
    {
      console.log("Invalid portfolio name");
      return res.status(401).send();
    }

  pool
  .query("SELECT portfolioname, portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1", [userID])
  .then((result) => {
    if (result.rows.length > 0) {
      let oldPortfolioName = result.rows[0].portfolioname;
      pool
      .query("UPDATE portfolio SET portfolioname=$2 WHERE portfolioid=( \
        SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1)", 
        [userID, newPortfolioName])
      .then(() => {
        console.log(oldPortfolioName, "was updated to", newPortfolioName);
        req.session.portfolio_name = newPortfolioName;
        res.status(200).send();
      })
      .catch((error) => {
        console.log("SQL Update Portfolio:", error);
        res.status(500).send();
      });
    } else {
      console.log(newPortfolioName, "does not exists");
      res.status(401).send();
    }
  })
  .catch((error) => {
    console.log("SQL Update Portfolio:", error);
    res.status(500).send();
  });
});

app.post("/update-portfolio-balance", (req, res) => {
  let balance = parseFloat(req.body.balance);
  let portfolioName = req.session.portfolio_name;

  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;

  if(!balance ||
    !portfolioName ||
    typeof balance !== "number" ||
    balance < 0 ||
    balance > 10000000.00)
    {
      console.log("Invalid balance");
      return res.status(401).send();
    }

    pool
    .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2", [userID, portfolioName])
    .then((result) => {
      if (result.rows.length > 0) {
        pool
        .query("UPDATE portfolio SET balance=$3 WHERE portfolioid=( \
          SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2)", 
          [userID, portfolioName, balance])
        .then(() => {
          console.log(portfolioName, "'s balance was updated");
          res.status(200).send();
        })
        .catch((error) => {
          console.log("SQL Update Portfolio:", error);
          res.status(500).send();
        });
      } else {
        console.log(portfolioName, "does not exists");
        res.status(401).send();
      }
    })
    .catch((error) => {
      console.log("SQL Update Portfolio:", error);
      res.status(500).send();
    });
});

app.get("/portfolioName", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  const userID = req.session.user_id;

  pool.query(
    "SELECT portfolioname FROM (SELECT * FROM portfolio WHERE userId = $1)",
    [userID]
  ).then((result) => {
    console.log(result.rows[0].portfolioname);
    res.status(200).json(result.rows[0].portfolioname);
  });
});

app.post("/add-stock", (req, res) => {
  let stockName = req.body.name.toUpperCase();
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
  let stockName = req.body.name.toUpperCase();
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

// Returns the number of shares of a current stock a user owns AND
// the total price of those stocks
app.get("/get-stock", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;
  let stockName = req.query.stockName.toUpperCase();
  let portfolioName = req.session.portfolio_name;

  pool
  .query("SELECT * FROM users WHERE userid = $1", [userID])
  .then((result) => {
    if (result.rows.length > 0) {
      pool
      .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
      AND portfolioname=$2", [userID, portfolioName])
      .then((result) => {
        if (result.rows.length > 0) {
          pool
          .query("SELECT stockamount, totalprice FROM portfolio_stock WHERE portfolioid= \
            (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
            AND portfolioname=$2) \
            AND stockname=$3", [userID, portfolioName, stockName])
          .then((result) => {
            let rows = result.rows;
            console.log(rows);
            res.status(200).send(rows);
          })
          .catch((error) => {
            console.log("SQL SELECT from portfolio_stock:", error);
            res.status(500).send();
          });
        } else {
          console.log(portfolioName, "fails to exist");
          res.status(401).send();
        }
      })
      .catch((error) => {
        console.log("SQL SELECT from Portfolio:", error);
        res.status(500).send();
      });
    } else {
      console.log(userID, "does not exist");
      res.status(401).send();
    }
  })
  .catch((error) => {
    console.log("SQL Select From users:", error);
    res.status(500).send();
  });
});

app.post("/buy-stock", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;
  let stockName = req.body.stockName.toUpperCase();
  let stockCount = req.body.stockCount;
  let portfolioName = req.session.portfolio_name;
  let totalBuyStockAmountValue = req.body.totalStockAmount;

  try {
    stockCount = parseInt(stockCount);
    totalBuyStockAmountValue = parseFloat(totalBuyStockAmountValue);
  } catch (error) {
    console.log("Stock Count or Stock Amount is not formatted correctly");
    return res.status(401).send();
  }

  if(!stockName ||
    !stockCount ||
    !portfolioName ||
    typeof stockName !== "string" ||
    typeof portfolioName !== "string" ||
    typeof stockCount !== "number" ||
    typeof totalBuyStockAmountValue !== "number" ||
    stockName.length < 1 ||
    stockName.length > 5 ||
    stockCount < 0 ||
    totalBuyStockAmountValue < 0 ||
    portfolioName.length < 1 ||
    portfolioName.length > 20)
    {
      console.log("Invalid stock or count or username or portfolio name.");
      return res.status(401).send();
    }

    pool
    .query("SELECT * FROM users WHERE userid=$1", [userID])
    .then((result) => {
      if (result.rows.length > 0) {
        pool
        .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2", [userID, portfolioName])
        .then((result) => {
          if (result.rows.length > 0) {
            pool
            .query("SELECT portfolioid FROM portfolio_stock WHERE portfolioid= \
              (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2) AND stockName= $3", [userID, portfolioName, stockName])
            .then((result) => {
              if (result.rows.length > 0) {
                pool
                .query("UPDATE portfolio_stock SET stockAmount=stockAmount+$3, totalprice=totalprice+$4 \
                  WHERE portfolioid= \
                  (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
                  AND portfolioname=$2) \
                  AND stockName = $5", [userID, portfolioName, stockCount, totalBuyStockAmountValue, stockName])
                .then(() => {
                  pool
                  .query("INSERT INTO portfolio_history (portfolioId, stockName, stockAmount, stockPrice, totalStock, portfolioBalance, transactionDate) \
                  VALUES ( \
                    (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                    CAST($3 AS VARCHAR), \
                    $4, \
                    $5, \
                    (SELECT stockamount FROM portfolio_stock WHERE portfolioid= \
                      (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
                      AND portfolioname=$2) \
                      AND stockname=$3), \
                    (SELECT balance FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                    (SELECT now()::timestamp(0)))", [userID, portfolioName, stockName, stockCount, totalBuyStockAmountValue])
                  .then(() => {
                    console.log(stockName, "was purchased (update)");
                    res.status(200).send();
                  }).catch((error) => {
                    console.log("SQL Insert into Portfolio_History:", error);
                    res.status(500).send();
                  })
                }).catch((error) => {
                  console.log("SQL Update Portfolio_Stock:", error);
                  res.status(500).send();
                });
              } else {
                pool
                .query("INSERT INTO portfolio_stock (portfolioId, stockName, stockamount, totalPrice) \
                VALUES ( \
                  (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                  $3, \
                  $4, \
                  $5)", [userID, portfolioName, stockName, stockCount, totalBuyStockAmountValue])
                .then(() => {
                  pool
                  .query("INSERT INTO portfolio_history (portfolioId, stockName, stockAmount, stockPrice, totalStock, portfolioBalance, transactionDate) \
                  VALUES ( \
                    (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                    CAST($3 AS VARCHAR), \
                    $4, \
                    $5, \
                    (SELECT stockamount FROM portfolio_stock WHERE portfolioid= \
                      (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
                      AND portfolioname=$2) \
                      AND stockname=$3), \
                    (SELECT balance FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                    (SELECT now()::timestamp(0)))", [userID, portfolioName, stockName, stockCount, totalBuyStockAmountValue])
                  .then(() => {
                    console.log(stockName, "was purchased (insert)");
                    res.status(200).send();
                  }).catch((error) => {
                    console.log("SQL Insert into Portfolio_History:", error);
                    res.status(500).send();
                  })
                }).catch((error) => {
                  console.log("SQL Insert Into Portfolio_Stock:", error);
                  res.status(500).send();
                });
              }
            }).catch((error) => {
              console.log("SQL Select From Portfolio_Stock:", error);
              res.status(500).send();
            });
          } else {
            console.log(portfolioName, "does not exists");
            res.status(401).send();
          }
        })
        .catch((error) => {
          console.log("SQL Select From Portfolio:", error);
          res.status(500).send();
        });
      } else {
        console.log(userID, "does not exists");
        res.status(401).send();
      }
    }).catch((error) => {
      console.log("SQL Select From Users:", error);
      res.status(500).send();
    })
  } 
);


app.post("/sell-stock", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;
  let stockName = req.body.stockName.toUpperCase();
  let stockSellCount = req.body.stockCount;
  let portfolioName = req.session.portfolio_name;
  let newTotalStockAmountValue = req.body.totalStockAmount;

  try {
    stockSellCount = parseInt(stockSellCount);
    newTotalStockAmountValue = parseFloat(newTotalStockAmountValue);
  } catch (error) {
    console.log("Stock Count or Stock Amount is not formatted correctly");
    return res.status(401).send();
  }

  if(!stockName ||
    !stockSellCount ||
    !portfolioName ||
    typeof stockName !== "string" ||
    typeof portfolioName !== "string" ||
    typeof stockSellCount !== "number" ||
    typeof newTotalStockAmountValue !== "number" ||
    stockName.length < 1 ||
    stockName.length > 5 ||
    stockSellCount < 0 ||
    newTotalStockAmountValue < 0 ||
    portfolioName.length < 1 ||
    portfolioName.length > 20)
    {
      console.log("Invalid stock or count or username or portfolio name.");
      return res.status(401).send();
    }

    pool
    .query("SELECT * FROM users WHERE userid = $1", [userID])
    .then((result) => {
      if (result.rows.length > 0) {
        pool
        .query("SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid= $1 \
          AND portfolioname=$2", [userID, portfolioName])
        .then((result) => {
          if (result.rows.length > 0) {
            pool
            .query("SELECT portfolioid FROM portfolio_stock WHERE portfolioid= \
              (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
              AND portfolioname=$2) \
              AND stockname=$3", [userID, portfolioName, stockName])
            .then((result) => {
              if (result.rows.length > 0) {
                pool
                .query("SELECT stockamount FROM portfolio_stock WHERE portfolioid= \
                  (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
                  AND portfolioname=$2) \
                  AND stockname=$3 \
                  AND stockamount>=$4", [userID, portfolioName, stockName, stockSellCount])
                .then((result) => {
                  if (result.rows.length > 0) {
                    pool
                    .query("UPDATE portfolio_stock SET stockamount=stockamount-$4, totalprice=$5 \
                        WHERE portfolioid= \
                      (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
                      AND portfolioname=$2) \
                      AND stockname=$3", [userID, portfolioName, stockName, stockSellCount, newTotalStockAmountValue])
                    .then(() => {
                      pool
                      .query("INSERT INTO portfolio_history (portfolioId, stockName, stockAmount, stockPrice, totalStock, portfolioBalance, transactionDate) \
                      VALUES ( \
                        (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                        CAST($3 AS VARCHAR), \
                        $4, \
                        $5, \
                        (SELECT stockamount FROM portfolio_stock WHERE portfolioid= \
                          (SELECT portfolioid FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 \
                          AND portfolioname=$2) \
                          AND stockname=$3), \
                        (SELECT balance FROM portfolio JOIN users ON portfolio.userid=users.userid WHERE users.userid=$1 AND portfolioname=$2), \
                        (SELECT now()::timestamp(0)))", [userID, portfolioName, stockName, (0 - stockSellCount), newTotalStockAmountValue])
                      .then(() => {
                        console.log(stockName, "was sold");
                        res.status(200).send();
                      }).catch((error) => {
                        console.log("SQL Insert into Portfolio_History:", error);
                        res.status(500).send();
                      })
                    })
                    .catch((error) => {
                      console.log("SQL Update Portfolio_Stock:", error);
                      res.status(500).send();
                    });
                  } else {
                    console.log("Amount must be less than what the user owns.");
                    return res.status(401).send();
                  }
                })
                .catch((error) => {
                  console.log("SQL Select From Portfolio_Stock:", error);
                  res.status(500).send();
                });
              } else {
                console.log(portfolioName, "does not own any", stockName);
                res.status(401).send();
              }
            })
            .catch((error) => {
              console.log("SQL Select From Portfolio_Stock:", error);
              res.status(500).send();
            });
          } else {
            console.log(portfolioName, "does not exists");
            res.status(401).send();
          }
        })
        .catch((error) => {
          console.log("SQL Select From Portfolio:", error);
          res.status(500).send();
        });
      } else {
        console.log(username, "does not exists");
        res.status(401).send();
      }
    }).catch((error) => {
      console.log("SQL Select from Users:", error);
      res.status(500).send();
    })
  });

// APLACA

const Alpaca = require('@alpacahq/alpaca-trade-api');
const exp = require("constants");
const alpaca = new Alpaca({
  keyId: env.alpaca_key,
  secretKey: env.alpaca_secret,
  paper: true,
});

app.get('/alpaca/market/:ticker', async (req, res) => {
  let ticker = req.params.ticker;
  let todaysDate = new Date();
  let tomorrowsDate = new Date();
  tomorrowsDate.setDate(todaysDate.getDate() + 1);

  const bars = alpaca.getBarsV2(ticker, {
    start: todaysDate.toISOString().split("T")[0],
    end: tomorrowsDate.toISOString().split("T")[0],
    timeframe: alpaca.newTimeframe(1, alpaca.timeframeUnit.MIN),
    limit: 35,
    feed: 'iex',
  });
  const got = [];
  for await (let b of bars) {
    got.push(b);
  }
  //console.log(got);
  res.json(got);
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});