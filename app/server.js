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

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

/*
const Alpaca = require('alpaca-trade-api');
const alpaca = new Alpaca({
  keyId: 'apikey',
  secretKey: 'secretkey',
  paper: true, // Use 'false' for live trading
  usePolygon: false, // Set to 'true' if you have a Polygon account
});

// Define callback functions
const tradeCallback = (trade) => {
  console.log('trade', trade);
};

const quoteCallback = (quote) => {
  console.log('quote', quote);
};

// Subscribe to real-time data
const subscribeToData = async () => {
  // Subscribe to trades for AAPL
  const tradeStream = alpaca.data_ws.trades('AAPL');
  tradeStream.onTrade(tradeCallback);

  // Subscribe to quotes for IBM
  const quoteStream = alpaca.data_ws.quotes('IBM');
  quoteStream.onQuote(quoteCallback);
};

// Handle connection and subscription errors
alpaca.data_ws.onConnect(() => {
  console.log('Connected to Alpaca WebSocket');
  subscribeToData();
});

alpaca.data_ws.onError((err) => {
  console.error('WebSocket Error:', err);
});

// Connect to Alpaca WebSocket
alpaca.data_ws.connect();

*/

// Python sample that is working
/*
from alpaca_trade_api.common import URL
from alpaca_trade_api.stream import Stream
async def trade_callback(t):
    print('trade', t)
async def quote_callback(q):
    print('quote', q)
# Initiate Class Instance
stream = Stream("apikey",
                "secretkey",
                base_url=URL('https://paper-api.alpaca.markets'),
                data_feed='iex')  # <- replace to 'sip' if you have PRO subscription
# subscribing to event
stream.subscribe_trades(trade_callback, 'AAPL')
stream.subscribe_quotes(quote_callback, 'IBM')
stream.run()
*/