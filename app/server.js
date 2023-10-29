let express = require("express");
let { Pool } = require("pg");
let env = require("../env.json");
let hostname = "localhost";
let port = 3000;
let app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("login"));


let pool = new Pool(env);
pool.connect().then(() => {
    console.log("Connected to database");
});

let saltRounds = 10;

app.post("/signup", (req, res) => {
  let username = req.body.username;
  let plaintextPassword = req.body.plaintextPassword;

  if(!username || 
    !plaintextPassword || 
    typeof username !== "string" || 
    typeof plaintextPassword !== "string" || 
    username.length < 1 || 
    username.length > 20 || 
    plaintextPassword.length < 8 || 
    plaintextPassword.length > 25) 
    {
      return res.status(401).send();
    }
  
  
  let myQuery = "SELECT * FROM users WHERE username = $1";
  pool.query(myQuery, [username]).then((result) => {
      if(result.rows.length > 0) {
        return res.status(401).send();
      }
      else {
        bcrypt
          .hash(plaintextPassword, saltRounds)
          .then((hashedPassword) => {
            pool
              .query(
                "INSERT INTO users (username, hashed_password) VALUES ($1, $2)",
                [username, hashedPassword],
              )
              .then(() => {
                // account created
                console.log(username, "account created");
                res.status(200).send();
              })
              .catch((error) => {
                // insert failed
                console.log(error);
                res.status(500).send();
              });
          })
          .catch((error) => {
            // bcrypt crashed
            console.log(error);
            res.status(500).send();
          });
      }
  }).catch((error) => {
      console.log(error);
  });
});



app.post("/signin", (req, res) => {
  let username = req.body.username;
  let plaintextPassword = req.body.plaintextPassword;
  pool
    .query("SELECT hashed_password FROM users WHERE username = $1", [username])
    .then((result) => {
      if (result.rows.length === 0) {
        // username doesn't exist
        return res.status(401).send();
      }
      let hashedPassword = result.rows[0].hashed_password;
      bcrypt
        .compare(plaintextPassword, hashedPassword)
        .then((passwordMatched) => {
          if (passwordMatched) {
            res.status(200).send();
          } else {
            res.status(401).send();
          }
        })
        .catch((error) => {
          // bcrypt crashed
          console.log(error);
          res.status(500).send();
        });
    })
    .catch((error) => {
      // select crashed
      console.log(error);
      res.status(500).send();
    });
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});