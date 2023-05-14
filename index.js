const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 8080;

const server = app.listen(
    PORT, () => console.log('Server alive on http://localhost:8080')
)

// src 폴더 모듈 임포트
const ps = require('/src/ps.js');
const team = require('/src/team.js');
const user = require('/src/user.js');



//postUser
app.post('/user', async (req, res) => {
    let {user_name} = req.params;
    
    
    let user_data = {
        user_id: "@@구현할부분@@"
    }
    
    res.send(user_data);
});

//getUser
app.get('/user/:user_id', async (req, res) => {
    let {user_id} = req.params;
    

    let user_data = {
        user_name: "유저명 (string)",
        team: "팀 존재 여부 (bool)"
    }

    res.send(user_data);
});





//getScheduleList
app.get('/ps/getScheduleList', async (req, res) => {
    // request body
    // "user_id": int
    // "date": string (date)
    const json = JSON.parse(req.body);


    let ps_data = {
        ps_id: "number",
	    ps_name: "string",
	    ps_startdate: "string",
	    ps_enddate: "string",
	    ps_memo: "string",
	    ps_type: "string",
	    ps_alarm: "boolean"
    }

    res.send(user_data);
});

//postSchedule
app.post('/ps/postSchedule', async (req, res) => {
    // request body
    // "user_id": int,
	// "ps_name": string,
	// "ps_startdate": string, (date)
	// "ps_enddate": string, (date)
	// "ps_memo": string,
	// "ps_type": string
    const json = JSON.parse(req.body);

    let ps_data = {
        user_id: "string",
	    ps_name: "string",
	    ps_startdate: "string",
	    ps_enddate: "string",
	    ps_memo: "string",
	    ps_type: "string"
    }

    res.send(user_data);
});

//updateSchedule
app.put('/ps/updateSchedule/:ps_id', async (req, res) => {
    // request body
    // "user_id": int,
	// "ps_name": string,
	// "ps_startdate": string, (date)
	// "ps_enddate": string, (date)
	// "ps_memo": string,
	// "ps_type": string
    let ps_id = req.params
    const json = JSON.parse(req.body);

    let ps_data = {
        ps_id: "number",
	    ps_name: "string",
	    ps_startdate: "string",
	    ps_enddate: "string",
	    ps_memo: "string",
	    ps_type: "string"
    }

    res.send(user_data);
});

//deleteSchedule
app.delete('/ps/deleteSchedule/:ps_id', async (req, res) => {
    let ps_id = req.params

    res.send("boolean"); //success(1) or fail(0)
});






//postTeam
app.post('/team', async (req, res) => {
    // request body
    // "user_id": int,
	// "team_name": string
    const json = JSON.parse(req.body);

    let team_data = {
        team_id: "number",
	    team_name: "string",
	    team_alarm: "boolean"
    }

    res.send(team_data);
});

//addTeamMember
app.post('/team/addTeamMember', async (req, res) => {
    // request body
    // "team_id": int,
	// "user_id": string
    const json = JSON.parse(req.body);

    res.send("boolean"); //success(1) or fail(0)
});

//deleteTeamMember
app.delete('/team/deleteTeamMember', async (req, res) => {
    // request body
    // "team_id": int,
	// "user_id": string
    const json = JSON.parse(req.body);

    res.send("boolean"); //success(1) or fail(0)
});

//getTeamList
app.get('/team/getTeamList/:user_id', async (req, res) => {
    let user_id = req.params


    let team_data = {
        team_id: "number",
        team_name: "string",
        
        /*
        team_members: [
            user_id: "number",
            user_name: "string"
        ],
        */ // 리스트

        team_alarm: "boolean",  // 팀 알림 on/off
        
        /*
        team_schedule: [ // 마감일 기준 가까운 팀 일정 최대 2개
            ts_name: "string",
            ts_enddate: "string"
        ],
        */ // 리스트
        team_link: "string"
    }

    res.send(tezm_data);
});


//Team Alarm 끄기지만 개인 알람에 해당하는데, Team 말고 user?
//updateTeamAlarm
app.put('/team/updateTeamAlarm', async (req, res) => {
    // request body
    // "team_id": number,
	// "user_id": number,
    let ps_id = req.params
    const json = JSON.parse(req.body);

    let ps_data = {
        team_alarm: "boolean"
    }

    res.send(ts_data);
});







//getTeamSeheduleList
app.get('/team/ts/getTeamScheduleList', async (req, res) => {
    // request body
    // "user_id": int
    // "date": string (date)
    const json = JSON.parse(req.body);


    let ts_data = {
        ts_id: "number",
	    ts_name: "string",
	    ts_startdate: "string",
	    ts_enddate: "string",
	    ts_memo: "string",
	    /*
        ts_members: [
            user_id: "number",
            user_name: "string"
        ]
        */ // 리스트
    }

    res.send(ts_data);
});

//postTeamSeheduleList
app.post('/team/ts', async (req, res) => {
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
    let ts_id = req.params
    const json = JSON.parse(req.body);

    let ts_data = {
        ts_id: "number"
    }

    res.send(ts_data);
});

//updateTeamSchedule
app.put('/team/ts/:ts_id', async (req, res) => {
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
    let ts_id = req.params
    const json = JSON.parse(req.body);

    let ts_data = {
        ts_name: "string",
	    ts_startdate: "string",
	    ts_enddate: "string",
	    ts_memo: "string",
        /*
        ts_members: [
            user_id: "number",
        ]
        */ // 리스트
    }

    res.send(ts_data);
});

//deleteTeamSchedule
app.delete('/team/ts/:ts_id', async (req, res) => {
    let ts_id = req.params

    res.send("boolean"); //success(1) or fail(0)
});




//getAvailableTimes
app.get('/team/time/:ts_id', async (req, res) => {
    // request body
    // "from": string (date)
    // "to": string (date)
    // "time": number
    let ts_id = req.params
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
    }

    res.send(ts_data);
});