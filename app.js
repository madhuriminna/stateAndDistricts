const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "covid19India.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DataBase Error:${e.massage}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/states/", async (request, response) => {
  const getStates = `
    select * from state;`;
  const getStateQuery = await db.all(getStates);
  response.send(getStateQuery);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `select * from state where
 state_id=${stateId};`;
  const getstateQueries = await db.get(getState);
  response.send(getstateQueries);
});

app.post("/districts/", async (request, response) => {
  const insertData = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = insertData;
  const getinsertQuery = `
   insert into 
   district (district_name,state_id,cases,
    cured,active,deaths) 
   values ('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}');`;
  await db.run(getinsertQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `select * from district where
 district_id=${districtId};`;
  const getDistrictQueries = await db.get(getDistrict);
  response.send(getDistrictQueries);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getState = `delete from district where
 district_id=${districtId};`;
  await db.get(getState);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const updateDistrict = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = updateDistrict;
  const updatedQuery = `
    update district set district_name='${districtName}',
    state_id='${stateId}',
    cases='${cases}',
    cured='${cured}',
    active='${active}',
    deaths='${deaths}'
    where
    district_id=${districtId};
    `;
  await db.run(updatedQuery);
  response.send("District Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const result = `
    select sum(cases) as totalCases,sum(cured) as totalCured,sum(active) as totalActive,sum(deaths) as totalDeaths from 
    district where state_id=${stateId};`;
  const result1 = await db.all(result);
  response.send(result1);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const result = `select state_name from state join district where district_id=${districtId} ;`;
  const result1 = await db.get(result);
  response.send(result1);
});
