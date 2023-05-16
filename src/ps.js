const mysql = require("./db");

module.exports.findSchedules = async (userId, date) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let rows = await conn.query(
        `SELECT * FROM ps where user_id = ${userId} and
        ps_startdate > ${date} AND ps_startdate < date_add(${date}, interval 1 DAY);`
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
    throw Error("findSchedules: " + e);
  }
};
