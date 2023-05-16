const mysql = require("./db");

module.exports.tempFunc = async (teamId) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let rows = await conn.query(
        `SELECT * FROM team where team_id = ${teamId}`
      );
      let res = JSON.parse(JSON.stringify(rows))[0];
      conn.release();
      return res;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("tempFunc: " + e);
  }
};
