const mysql = require("./db");

module.exports.createTable = async () => {
  try {
    var userQ = `CREATE TABLE IF NOT EXISTS User (user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(50) NOT NULL); `;
    let psQ =
      "CREATE TABLE IF NOT EXISTS PS (ps_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, ps_name VARCHAR(50) NOT NULL, ps_startdate DATE NOT NULL, ps_enddate DATE, ps_memo VARCHAR(500), ps_type VARCHAR(50), ps_alarm BOOLEAN NOT NULL DEFAULT TRUE, FOREIGN KEY (user_id) references User (user_id));";
    let teamQ =
      "CREATE TABLE IF NOT EXISTS Team ( team_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, team_name VARCHAR(50) NOT NULL, team_link VARCHAR(200) NOT NULL);";
    let teammemberQ =
      "CREATE TABLE IF NOT EXISTS Team_Member ( team_id INT NOT NULL, user_id INT NOT NULL, FOREIGN KEY (team_id) references Team(team_id), FOREIGN KEY (user_id) references User (user_id));";
    let tsQ =
      "CREATE TABLE IF NOT EXISTS TS ( ts_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, team_id INT NOT NULL, ts_name VARCHAR(50) NOT NULL, ts_startdate DATE NOT NULL, ts_enddate DATE, ts_memo VARCHAR(500),FOREIGN KEY (team_id) references Team(team_id));";

    let conn = await mysql.getConnection();
    await conn.query(userQ);
    await conn.query(psQ);
    await conn.query(teamQ);
    await conn.query(teammemberQ);
    await conn.query(tsQ);
    console.log("CREATE TABLE");
    conn.release();
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};
