const mysql = require("mysql2/promise");

module.exports = mysql.createPool({
  host: "localhost",
  port: "3305",
  user: "root",
  password: "0805",
  database: "skal",
  connectTimeout: 5000,
  connectionLimit: 30, //default 10
});
