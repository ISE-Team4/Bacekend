const mysql = require("./db");

module.exports.saveUser = async (userName) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let rows = await conn.query(
        `INSERT INTO User(user_name) value ('${userName}')`
      );
      let res = JSON.parse(JSON.stringify(rows))[0];
      conn.release();
      return res["insertId"];
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("saveUser: " + e);
  }
};

module.exports.findUser = async (userId) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let rows = await conn.query(
        `SELECT u.user_name, tm.team_id FROM User u
        LEFT JOIN Team_Member tm ON u.user_id = tm.user_id
        WHERE u.user_id = ${userId}`
      );
      let res = JSON.parse(JSON.stringify(rows))[0][0];
      if (res["team_id"] == null) {
        res["team"] = false;
      } else {
        res["team"] = true;
      }
      conn.release();
      return res;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("findUser: " + e);
  }
};
