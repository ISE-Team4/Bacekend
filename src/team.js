const mysql = require("./db");

module.exports.saveTeam = async (
  userId,
  name
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      const teamId = Math.floor(Math.random() * 2147483647);
      const link = "https://" + teamId.toString();
      let rows = await conn.query(
        `INSERT INTO Team(team_id, user_id, team_name, team_link, team_alarm)
        VALUE (${teamId}, ${userId}, '${name}', '${link}', 1);`
      );
      let res = JSON.parse(JSON.stringify(rows))[0];
      conn.release();
      return teamId;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("saveTeam: " + e);
  }
};

module.exports.addTeamMember = async (
  teamId,
  userId
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let values = await conn.query(
        `SELECT team_name, team_link FROM Team WHERE team_id = ${teamid};`
      );
      let rows = await conn.query(
        `INSERT INTO Team(team_id, user_id, team_name, team_link, team_alarm)
        VALUE (${teamId}, ${userId}, '${values[0].team_name}', '${values[0].team_link}', 1);`
      );
      conn.release();
      return 1;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("addTeamMember: " + e);
  }
};

module.exports.deleteTeamMember = async (
  teamId,
  userId
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let rows = await conn.query(
        `DELETE FROM Team WHERE team_id = ${teamId} AND user_id = ${userId};`
      );
      conn.release();
      return 1;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("deleteTeamMember: " + e);
  }
};

//findTeam에서 사용하는 함수
const getTeamData = async (teamId, today, conn) => {
  const teamInfo = await conn.query(`SELECT team_name, team_link, team_alarm FROM Team WHERE team_id = ${teamId} LIMIT 1;`);
  const userIdList = await conn.query(`SELECT user_id FROM Team WHERE team_id = ${teamId};`);
  const scheduleList = await conn.query(`SELECT ts_name, ts_enddate FROM TS WHERE team_id = ${teamId} AND team_schedule >= ${today} ORDER BY team_schedule LIMIT 2;`);

  const result = {
    team_id: teamId,
    team_name: teamInfo[0].team_name,
    team_members: userIdList,
    team_alarm: teamInfo[0].team_alarm,
    team_schedule: scheduleList,
    team_link: teamInfo[0].team_link
  }

  return result
}

module.exports.findTeam = async (userId) => {
  try {
    let conn = await mysql.getConnection();
    try {
      // 1. team_id 리스트 받아오기
      // 2. 1의 team_id에 대해 각각 team_name, team_link, team_alarm 받아오기
      // 3. team_id로 user_id(team_members) 검색하기
      // 4. team_id로 team_schedule 마감일 가까운 2개 검색하기
      let teamIds = await conn.query(
        `SELECT team_id FROM Team WHERE user_id = ${userId};`
      );

      let today = new Date();
      let year = today.getFullYear();
      let month = ('0' + (today.getMonth() + 1)).slice(-2);
      let day = ('0' + today.getDate()).slice(-2);
      let dateStr = `${year}-${month}-${day}`;
      
      Promise.all(teamIds.map(item => getTeamData(item.team_id, today, conn)))
        .then(data => console.log(data))
        .catch(err => console.error(err));
      
      conn.release();
      return data;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("findTeam: " + e);
  }
};

module.exports.updateTeamAlarm = async (
  userId,
  teamId
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      await conn.query(
        `UPDATE Team 
        SET team_alarm = CASE 
          WHEN team_alarm = 0 THEN 1
          ELSE 0
        END
        WHERE user_id = ${userId} AND team_id = ${teamId};`
      );
      const rows = await conn.query(
        `SELECT team_alarm FROM Team WHERE user_id = ${userId} AND team_id = ${teamId};`
      );
      conn.release();
      return rows[0].team_alarm;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("updateTeamAlarm: " + e);
  }
};

module.exports.getTeamSchedule = async (
  teamId,
  date
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let tsInfo = await conn.query(
        `SELECT ts_id, ts_name, ts_startdate, ts_enddate, IFNULL(ts_memo, ''), user_id 
        FROM TS WHERE team_id = ${teamId} AND ts_startdate <= ${date} AND ${date} <= ts_enddate;`
      );
      
      let members = tsinfo.map(async obj => {
        const rows = await conn.query(
          `SELECT user_name FROM User WHERE user_id = ${obj.user_id};`
        )
        return {user_id: obj.user_id, user_name: rows[0].user_name};
      });

      conn.release();

      const result = {
        ts_id: tsInfo[0].ts_id,
        ts_name: tsInfo[0].ts_name,
        ts_startdate: tsInfo[0].ts_startdate,
        ts_enddate: tsInfo[0].ts_enddate,
        ts_memo: ts_memo ?? "",
        ts_members: members
      }
      return result;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("getTeamSchedule: " + e);
  }
};

module.exports.saveTeamSchedule = async (
  teamId,
  name,
  startdate,
  enddate,
  _memo,
  members
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      const tsId = Math.floor(Math.random() * 2147483647);
      let memo = _memo ?? "";
      let rows = members.map(member => [tsId, teamId, member, name, startdate, enddate, memo]);
      
      await conn.query(
        `INSERT INTO TS (ts_id, team_id, user_id, ts_name, ts_startdate, ts_enddate, ts_memo) VALUES ${rows}`
      );

      conn.release();
      return tsId;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("saveTeamSchedule: " + e);
  }
};

module.exports.updateTeamSchedule = async (
  tsId,
  name,
  startdate,
  enddate,
  _memo,
  members
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let memo = _memo ?? "";

      let teamId = await conn.query(
        `SELECT team_id FROM TS WHERE ts_id = ${teamId} LIMIT 1;`
      );

      let rows = members.map(member => [tsId, teamId[0].team_id, member, name, startdate, enddate, memo]);
      
      await conn.query(
        `DELETE FROM TS WHERE ts_id = ${tsId};`
      );

      await conn.query(
        `INSERT INTO TS (ts_id, team_id, user_id, ts_name, ts_startdate, ts_enddate, ts_memo) VALUES ${rows};`
      );

      conn.release();
      const result = {
        ts_name: name,
        ts_startdate: startdate,
        ts_enddate: enddate,
        ts_memo: memo,
        ts_members: members
      }
      return tsId;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("updateTeamSchedule: " + e);
  }
};

module.exports.deleteTeamSchedule = async (
  tsId
) => {
  try {
    let conn = await mysql.getConnection();
    try {
      let rows = await conn.query(
        `DELETE FROM Team WHERE ts_id = ${tsId};`
      );
      conn.release();
      return 1;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  } catch (e) {
    console.log(e);
    throw Error("deleteTeamSchedule: " + e);
  }
};

