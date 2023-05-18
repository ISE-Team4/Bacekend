const { execSync } = require("child_process");

module.exports.findSpace = async (userID, userPWD, from, to) => {
  try {
    from = new Date(from);
    to = new Date(to);
    
    let response = execSync(
      `python ./space_reservation/reservation.py -F -i ${userID} -p ${userPWD} -s ${from.getTime()} -e ${to.getTime()}`
    );

    return JSON.parse(response.toString().replace(/'/g, '"'));
  } catch (e) {
    console.log(e);
    throw Error("find_space: " + e);
  }
};

module.exports.submitReservation = async (userID, userPWD, from, to) => {
    try {
      let response = execSync(
        `python ./space_reservation/reservation.py -S -i ${userID} -p ${userPWD} -s ${from.getTime()} -e ${to.getTime()}`
      );
  
      return JSON.parse(response.toString().replace(/'/g, '"'));
    } catch (e) {
      console.log(e);
      throw Error("find_space: " + e);
    }
};

// find_space(
//   "id",
//   "pswd",
//   new Date("2023-05-24 12:00:00"),
//   new Date("2023-05-24 13:00:00")
// );
