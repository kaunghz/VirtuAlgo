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
app.get("/data", (req, res) => {
  pool.query("SELECT * FROM stuff").then(result => {
    res.json({data: result.rows});
  });
});
app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});