const express = require("express")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")

app.ues(express.json())

const databasePath = path.join(__dirname,"covid19India.db")

const database = null

const instilizeServer =async () => {
    try{
        database = await open({
            filename : databasePath,
            driver : sqlite3,
        })
        app.listen(3000, () => {
            console.log("Server Logged In : http://localhost:3000/")
        })
    catch(error){
        console.log(`ERROR at db ${error.message}`),
        process.exit(1)
    }
    }
}
instilizeServer()

const convertObjToResponseObj = (obj) => {
    return{
        stateId : obj.state_id,
        stateName : obj.state_name,
        population : obj.population,
        districtName : obj.district_name,
        cases : obj.cases,
        cured : obj.cured,
        active : obj.active,
        deaths : obj.deaths,
        districtId : obj.district_id,
    }
}

app.get("/states/", async (request,response) =>{
    const getStates = `
    SELECT *
    FROM state`
    const state = await database.all(getStates)
    response.send(state.map(each) => {
        convertObjToResponseObj(each)
    })
})

app.get("/states/:stateId/", async (request,response) => {
    const { stateId } = request.params
    const getOnlyStates = `SELECT *
    FROM state
    WHERE state_id = ${stateId}`
    const state = await database.get(getOnlyStates)
    response.send(state.map(each) => {
        convertObjToResponseObj(each)
    })
})

app.post("/districts/", async (request,response) => {
    const { districtName,stateId,cases,cured,active,deaths} = request.body
    const insertDistrict = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    VALUES
       (${districtName}, ${stateId} ,${cases} ,${cured},${active},${deaths})
    `
    const district = await database.run(insertDistrict)
    response.send("District Details Updated")
})

app.get("/districts/:districtId/", async (request,response) =>  {
    const { districtId } = request.params
    const getDistricts = `SELECT *
    FROM district
    WHERE district_id = ${districtId}`
    const district = await database.get(getDistricts)
    response.send(district.map(each) => {
        convertObjToResponseObj(each)
    })
    
    
})

app.delete(" /districts/:districtId/", async (request,response) => {
    const { districtId } = request.params
    const deleteDistrict = `DELETE FROM district
    WHERE district_id = ${districtId}`
    const district = await database.run(deleteDistrict)
    response.send("District Removed")
})

app.put("/districts/:districtId/", async (request,response) => {
    const { districtId } = request.params
    const updateDistrict = `UPDATE district
    SET 
        district_name = ${districtName},
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths =${deaths}
    WHERE district_id = ${districtId}`
    const district = await database.run(updateDistrict)
    response.send("District Details Updated") 
})

app.get("/states/:stateId/stats/",async (request,response) => {
    const {stateId} = request.body
    const GetStateStats = `SELECt 
        SUM(cases),
        SUM(cured),
        SUM(active),
        SUM(deaths)
    FROM
        district
    WHERE
        state_id = ${stateId}`
    const state = await database.get(GetStateStats)
    console.log(state)

    response.send({
        totalCases : state["SUM(cases)"],
        totalCured : state["SUM(cured)"],
        totalActive : state["SUM(active)"],
        totalDeaths : state["SUM(deaths)"],
    })
})

app.get("/districts/:districtId/details/", async (request,response) => {
    const { districtId } = request.body
    const getDistrict = `SELECT state_id
    FROM district
    WHERE district_id = ${districtId}`
    const district = await database.get(getDistrict)

    const getState = `SELECT state_name AS stateName
    FROM state
    WHERE state_id = ${district.state_id}`
    const state = await database.get(getState)
    response.send(state)
})

module.exports = app;