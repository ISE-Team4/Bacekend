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
    throw Error(e);
  }
};
