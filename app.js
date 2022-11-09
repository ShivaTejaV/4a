const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  let new_array = [];
  for (let ele of playersArray) {
    new_array.push(convertDbObjectToResponseObject(ele));
  }
  response.send(new_array);
});

// API 2
app.post("/players/", async (request, response) => {
  try {
    let playerDetails = request.body;
    let { playerName, jerseyNumber, role } = playerDetails;
    let f1 = async () => {
      try {
        const Query = `
        SELECT
        *
        FROM
        cricket_team
        ORDER BY
        player_id DESC
        LIMIT 1;`;

        const playersArray = await db.get(Query);
        const l = playersArray.length;
        const new_id = playersArray.player_id;

        return new_id;
      } catch (e) {
        console.log(e);
      }
    };
    let playerId = await f1();
    playerId += 1;
    const addPlayerQuery = `
    INSERT INTO cricket_team(player_id,player_name,jersey_number,role)
    VALUES(
        ${playerId},
        "${playerName}",
        ${jerseyNumber},
        "${role}"
    );`;
    const dbResponse = await db.run(addPlayerQuery);
    response.send("Player Added to Team");
    //console.log(playerId);
  } catch (error) {
    console.log(error);
  }
});

// API 3
app.get("/players/:playerId", async (request, response) => {
  try {
    let player = request.params;
    let { playerId } = player;
    let id = parseInt(playerId);
    const getPlayerQuery = `
      SELECT 
        * 
      FROM 
        cricket_team
      WHERE 
        player_id = ${id};`;
    const playerDetails = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(playerDetails));
  } catch (error) {
    console.log(error);
  }
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    let id = parseInt(playerId);
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;

    const updatePlayerQuery = `
        UPDATE
         cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE player_id = ${id};
        ;`;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (error) {
    console.log(error);
  }
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    const id = parseInt(playerId);
    const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${id};
    `;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
