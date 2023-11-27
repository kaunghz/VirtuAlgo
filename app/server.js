const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");
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
// app.use(express.static("login"));
app.use(express.static("algotrade"));
app.use(express.static("portfolio"));

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
            console.log(userID);
            req.session.user_id = userID;
            req.session.username = username;
            req.session.authenticated = true;
          })
          .catch((error) => {
            console.log("SQL Select From Users:", error);
            res.status(500).send();
          });

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
    .query("SELECT userID, saltedPass FROM users WHERE username = $1", [username])
    .then((result) => {
      if (result.rows.length === 0) {
        console.log(username, "does not exists");
        return res.status(401).send();
      }
      let userID = result.rows[0].userid;
      let saltedPassword = result.rows[0].saltedpass;
      bcrypt
        .compare(plaintextPassword, saltedPassword)
        .then((passwordMatched) => {
          if (passwordMatched) {
            console.log(username, "logged in");
            req.session.user_id = userID;
            req.session.username = username;
            req.session.authenticated = true;
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


app.get("/get-algorithms", (req, res) => {
  if(!req.session || !req.session.authenticated) {
    console.log("Current User is not authenticated");
    return res.status(401).send("User is not authenticated");
  }

  let userID = req.session.user_id;
  console.log(userID);
  pool.query(
    "SELECT * FROM ALGORITHMS WHERE userid = $1", [userID]
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
  let portfolioName = req.body.portfolioName;
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

// Returns the number of shares of a current stock a user owns AND
// the total price of those stocks
app.get("/get-stock", (req, res) => {
  let userID = req.session.user_id;
  let stockName = req.query.stockName;
  let portfolioName = req.query.portfolioName;

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
  let userID = req.session.user_id;
  let stockName = req.body.stockName;
  let stockCount = req.body.stockCount;
  let portfolioName = req.body.portfolioName;
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
                  console.log(stockName, "was purchased (update)");
                  res.status(200).send();
                })
                .catch((error) => {
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
                  console.log(stockName, "was purchased (insert)");
                  res.status(200).send();
                })
                .catch((error) => {
                  console.log("SQL Insert Into Portfolio_Stock:", error);
                  res.status(500).send();
                });
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
  let userID = req.session.user_id;
  let stockName = req.body.stockName;
  let stockSellCount = req.body.stockCount;
  let portfolioName = req.body.portfolioName;
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
                      console.log(stockName, "was sold");
                      res.status(200).send();
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