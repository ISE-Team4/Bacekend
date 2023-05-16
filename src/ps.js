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

module.exports.saveSchedule = async (
  userId,
  name,
  startdate,
  _enddate,
  _memo,
  type
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let memo = _memo ?? "";
      let enddate = _enddate ?? "";
      let rows = await conn.query(
        `INSERT INTO PS (user_id, ps_name, ps_startdate, ps_enddate, ps_memo, ps_type)
        VALUE (${userId}, '${name}', '${startdate}', '${enddate}', '${memo}', '${type}')`
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
    throw Error("saveSchedule: " + e);
  }
};
