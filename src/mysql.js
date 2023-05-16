const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0805",
  database: "skal",
});

connection.connect();

var startQuery = `
        CREATE TABLE IF NOT EXISTS User (
            user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_name VARCHAR(50) NOT NULL);

        CREATE TABLE IF NOT EXISTS PS (
            ps_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ps_name VARCHAR(50) NOT NULL,
            ps_startdate DATE NOT NULL,
            ps_enddate DATE,
            ps_memo VARCHAR(500),
            ps_type VARCHAR(50),
            ps_alarm BOOLEAN NOT NULL DEFAULT TRUE,
            FOREIGN KEY (user_id) references User(user_id));

        CREATE TABLE IF NOT EXISTS Team (
            team_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            team_name VARCHAR(50) NOT NULL,
            team_link VARCHAR(200) NOT NULL);

        CREATE TABLE IF NOT EXISTS Team_Member (
            team_id INT NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (team_id) references Team(team_id),
            FOREIGN KEY (user_id) references User(user_id));
        
        CREATE TABLE IF NOT EXISTS TS (
            ts_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            team_id INT NOT NULL,
            ts_name VARCHAR(50) NOT NULL,
            ts_startdate DATE NOT NULL,
            ts_enddate DATE,
            ts_memo VARCHAR(500),
            FOREIGN KEY (team_id) references Team(team_id));
    `;

connection.query(startQuery, (error, rows, fields) => {
  if (error) throw error;
  console.log("CREATE TABLE");
});

connection.end();
