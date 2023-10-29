let express = require("express");
let { Pool } = require("pg");
let env = require("../env.json");
let hostname = "localhost";
let port = 3000;
let app = express();
let pool = new Pool(env);
pool.connect().then(() => {
    console.log("Connected to database");
});

app.use(express.static("public"));
app.use(express.static("login"));

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});