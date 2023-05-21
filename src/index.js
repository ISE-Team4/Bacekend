const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 8080;

const server = app.listen(PORT, () =>
  console.log("Server alive on http://localhost:8080")
);

// src 폴더 모듈 임포트
const ps = require("./ps");
const team = require("./team");
const user = require("./user");
const db = require("./mysql");
const reservation = require("./reservation");

db.createTable();

/**
 * User API
 */
//postUser
app.post("/user", async (req, res) => {
  let { user_name } = req.body;

  let userId = await user.saveUser(user_name);
  console.log(userId);

  let user_data = {
    user_id: userId,
  };

  res.send(user_data);
});

//getUser
app.get("/user/:user_id", async (req, res) => {
  let { user_id } = req.params;

  let userObj = await user.findUser(user_id);
  // console.log(userObj);

  let user_data = {
    user_name: userObj["user_name"],
    team: userObj["team"],
  };

  res.send(user_data);
});

/**
 * PS API
 */

//getScheduleList
app.get("/ps/:user_id", async (req, res) => {
  // request
  // "user_id": int
  // "date": string
  let { user_id } = req.params;
  let { date } = req.query;

  let psObj = await ps.findSchedules(user_id, date);

  res.send(psObj);
});

//postSchedule
app.post("/ps", async (req, res) => {
  // request body
  // "user_id": int,
  // "ps_name": string,
  // "ps_startdate": string, (date)
  // "ps_enddate": string, (date)
  // "ps_memo": string,
  // "ps_type": string
  let json = req.body;
  let psId = await ps.saveSchedule(
    json["user_id"],
    json["ps_name"],
    json["ps_startdate"],
    json["ps_enddate"],
    json["ps_memo"],
    json["ps_type"]
  );

  let ps_data = {
    ps_id: psId,
  };

  res.send(ps_data);
});

//updateSchedule
app.put("/ps/:ps_id", async (req, res) => {
  // request body
  // "ps_id": int,
  // "ps_name": string,
  // "ps_startdate": string, (date)
  // "ps_enddate": string, (date)
  // "ps_memo": string,
  let { ps_id } = req.params;
  const json = req.body;
  let psId = await ps.updateSchedule(
    ps_id,
    json["ps_name"],
    json["ps_startdate"],
    json["ps_enddate"],
    json["ps_memo"]
  );

  let ps_data = {
    ps_id: psId,
  };

  res.send(ps_data);
});

//deleteSchedule
app.delete("/ps/:ps_id", async (req, res) => {
  let { ps_id } = req.params;
  await ps.deleteSchedule(ps_id);
  res.send(true); //success(1) or fail(0)
});

/**
 * Team API
 */
//postTeam
app.post("/team", async (req, res) => {
  // request body
  // "user_id": int,
  // "team_name": string
  const json = JSON.parse(req.body);

  let team_info = await team.saveTeam(
    json["user_id"],
    json["team_name"]
  );

  let team_data = {
    team_id: team_info["teamId"],
    team_name: json["team_name"],
    team_alarm: "True"
  };

  res.send(team_data);
});

//addTeamMember
app.post("/team/addTeamMember", async (req, res) => {
  // request body
  // "team_id": int,
  // "user_id": string
  const json = JSON.parse(req.body);

  let success = await team.addTeamMember(
    json["team_id"],
    json["user_id"]
  );

  res.send(success); //success(1) or error logged in team.js
});

//deleteTeamMember
app.delete("/team/deleteTeamMember", async (req, res) => {
  // request body
  // "team_id": int,
  // "user_id": string
  const json = JSON.parse(req.body);

  let success = await team.deleteTeamMember(
    json["team_id"],
    json["user_id"]
  );

  res.send(success); //success(1) or fail(0)
});

//getTeamList
app.get("/team/getTeamList/:user_id", async (req, res) => {
  let user_id = req.params;

  let team_info = await team.findTeam(user_id);

  res.send(team_info);
});

//updateTeamAlarm
app.put('/team/updateTeamAlarm', async (req, res) => {
  // request body
  // "team_id": number,
 	// "user_id": number,
  const json = JSON.parse(req.body);
  
  let alarm = await team.updateTeamAlarm(
    json["team_id"],
    json["user_id"]
  );

  res.send(alarm); // 1 if on, 0 if off
});

//getTeamSeheduleList
app.get("/team/ts/getTeamScheduleList", async (req, res) => {
  // request body
  // "team_id": int
  // "date": string (date)
  const json = JSON.parse(req.body);

  let schedule = await team.getTeamSchedule(
    json["team_id"],
    json["date"]
  );

  res.send(schedule);
});

//postTeamSeheduleList
app.post("/team/ts", async (req, res) => {
  // request body
  // "team_id": number,
  // "ts_name": string,
  // "ts_startdate": string, (date)
  // "ts_enddate": string, (date)
  // "ts_memo": string,
  /*
        ts_members: [
            user_id: "number",
        ]
    */ // 리스트
  const json = JSON.parse(req.body);

  let schedule = await team.saveTeamSchedule(
    json["team_id"],
    json["ts_name"],
    json["ts_startdate"],
    json["ts_enddate"],
    json["ts_memo"],
    json["ts_members"]
  );

  res.send(schedule);
});

//updateTeamSchedule
app.put("/team/ts/:ts_id", async (req, res) => {
  // request body
  // "ts_name": int,
  // "ts_startdate": string, (date)
  // "ts_enddate": string, (date)
  // "ts_memo": string,
  /*
        ts_members: [
            user_id: "number",
        ]
    */ // 리스트
    let ts_id = req.params;
    const json = JSON.parse(req.body);
  
    let schedule = await team.saveTeamSchedule(
      ts_id,
      json["team_id"],
      json["ts_name"],
      json["ts_startdate"],
      json["ts_enddate"],
      json["ts_memo"],
      json["ts_members"]
    );
  
    res.send(schedule);
});

//deleteTeamSchedule
app.delete("/team/ts/:ts_id", async (req, res) => {
  let ts_id = req.params;

  let schedule = await team.saveTeamSchedule(ts_id);

  res.send("boolean"); //success(1) or fail(0)
});

//getAvailableTimes
app.get("/team/time/:ts_id", async (req, res) => {
  // request body
  // "from": string (date)
  // "to": string (date)
  // "time": number
  let ts_id = req.params;
  const json = JSON.parse(req.body);

  let ts_data = {
    available: "boolean",
    /*
        times: [
            {
                date: "string",
                members: [
                    user_id: "number",
                    user_name: "string"
                ]
            }
        ]
        */ // 리스트
  };

  res.send(ts_data);
});

//getAvailableSpaces
app.get("/reservation/space/:user_id", async (req, res) => {
  // request body
  // "from": string (date)
  // "to": string (date)
  let user_id = req.params;
  // user_id로 skku_id, skku_pwd 찾는 query 필요
  const json = JSON.parse(req.body);

  let available_space = await find_space(skku_id, skku_pwd, json.from, json.to);
  /*
    {
      "available": "boolean",
      "space": [
        "str",
        "str",
        ...
      ]
    }
  */

  res.send(available_space);
});
