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

const Alpaca = require('@alpacahq/alpaca-trade-api');
let alpa = express();


// Replace 'your-api-key-id' and 'your-secret-key' with your actual Alpaca API key and secret
const alpaca = new Alpaca({
  keyId: 'your api',
  secretKey: 'your secret key to test',
  paper: true, // Set to false for live trading
});

// Define a route to handle the request
alpa.get('/', async (req, res) => {
  try {
    const quotes = await getQuotes();
    res.send(`<pre>${JSON.stringify(quotes, null, 2)}</pre>`);
  } catch (error) {
    res.status(500).send('Error fetching quotes');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Function to get quotes
async function getQuotes() {
  const quotes = [];
  const quoteIter = await alpaca.getQuotes('MSFT', '2023-09-08', '2023-09-08', { limit: 10 });

  for await (const quote of quoteIter) {
    processQuote(quote);
    quotes.push(quote);
  }

  return quotes;
}

// Function to process a quote
function processQuote(quote) {
  console.log(quote);
}
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