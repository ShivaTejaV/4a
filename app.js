const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

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
  response.send(playersArray);
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
        ${playerName},
        ${jerseyNumber},
        ${role}
    );`;
    const dbResponse = await db.run(addPlayerQuery);
    response.send("Player Added to Team");
    //console.log(playerId);
  } catch (error) {
    console.log(error);
  }
});
