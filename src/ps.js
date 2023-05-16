const mysql = require("./db");

module.exports.findSchedules = async (userId, date) => {
  try {
    let conn = await mysql.getConnection();
    try {
      // SELECT * FROM ps where user_id = 7 and
      //   DATE(ps_startdate) >= '2023-05-16' AND DATE(ps_enddate) <= '2023-05-17'
      let rows = await conn.query(
        `SELECT * FROM ps where user_id = ${userId} and
        DATE(ps_startdate) <= ${date} AND DATE(ps_enddate) >= ${date}`
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

module.exports.updateSchedule = async (
  psId,
  name,
  startdate,
  enddate,
  memo
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      await conn.query(
        `UPDATE PS 
          SET ps_name = '${name}', ps_startdate = '${startdate}', ps_enddate = '${enddate}', ps_memo = '${memo}'
        WHERE ps_id = ${psId}`
      );
      conn.release();
      return psId;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("updateSchedule: " + e);
  }
};

module.exports.deleteShedule = async (psId) => {
  try {
    let conn = await mysql.getConnection();
    try {
      await conn.query(`DELETE FROM ps WHERE ps_id = ${psId}`);
      conn.release();
      return psId;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("deleteShedule: " + e);
  }
};
