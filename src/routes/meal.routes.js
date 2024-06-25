const express = require('express')
const router = express.Router()
const validateToken = require('./authentication.routes').validateToken
const db = require('../dao/mysql-db')
const logger = require('../util/logger')

router.post("", validateToken, async (req, res) => {
    console.log(`POST /api/meal body:`)
    console.log(req.body)

    // Validate fields
    const {
       id, isactive, isvega, isvegan, istotakehome,
       datetime, maxamountofparticipants, price,
       imageurl, name, description, allergenes  
    } = req.body

    const cookid = req.userId || "NULL";

    if (
        !id, !isactive || !isvega || !isvegan || !istotakehome ||
        !datetime || !maxamountofparticipants || !price ||
        !imageurl || !name || !description || !allergenes
    ) {
        res.status(400).json({
            status: 400,
            message: "Fields are missing",
            data: {}
        })
    }

    db.getConnection(function (err, connection) {
        const query = `INSERT INTO meal VALUES (${id}, ${isactive},${isvega},${isvegan},${istotakehome},'${datetime}',${maxamountofparticipants},${price},'${imageurl}', ${cookid}, NOW(), NOW(), "${name}","${description}",'${allergenes}')`;
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
                    res.status(400).json({
                        status: 400,
                        message: error.message,
                        data: {}
                    })
                    return
                } else {
                    logger.debug(results)
                    res.status(200).json({
                        status: 200,
                        message: `Meal succesfully inserted.`,
                        data: req.body
                    })
                }
            }
        )
    })
});

router.put("", validateToken, async (req, res) => {
    console.log(`PUT /api/meal body:`)
    console.log(req.body)

    // Validate fields
    const {
       id, isactive, isvega, isvegan, istotakehome,
       datetime, maxamountofparticipants, price,
       imageurl, name, description, allergenes  
    } = req.body

    const cookid = req.body.cookid;

    if (
        !id, !isactive || !isvega || !isvegan || !istotakehome ||
        !datetime || !maxamountofparticipants || !price ||
        !imageurl || !name || !description || !allergenes
    ) {
        res.status(400).json({
            status: 400,
            message: "Fields are missing",
            data: {}
        })
    }
    
    db.getConnection(function (err, connection) {
        const query = `SELECT cookid FROM meal WHERE id = ${id}`;
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()
                
                console.log(req.userId + " " + results[0].cookid)
                //Check if cookid matches authorization
                if (req.userId != results[0].cookid || results[0].cookId == "NULL") {
                    res.status(401).json({
                        status: 401,
                        message: "Userid " + req.userId + " is not authorized to edit this meal.",
                        data: {}
                    })
                }
            }
        )
        let query2 = `UPDATE meal SET 
        id = ${id}, isActive = ${isactive}, isVega = ${isvega}, isVegan = ${isvegan},
        isToTakeHome = ${istotakehome}, dateTime = '${datetime}', maxAmountOfParticipants = ${maxamountofparticipants},
        price = ${price}, imageUrl = '${imageurl}', updateDate = NOW(), name = "${name}", description = "${description}", allergenes = '${allergenes}'`;
        
        // Add new cookid if specified
        if (cookid) {
            query2 = query2 + `, cookid = ${cookid}`
        }

        // Add where clause
        query2 = query2 + ` WHERE id = ${id};`

        console.log(`Executing query on db: `)
        console.log(query2) 
        connection.query(query2, function (error, results, fields) {
            connection.release()
        
            if (error) {
                logger.error(error)
                res.status(400).json({
                    status: 400,
                    message: error.message,
                    data: {}
                })
                return
            } else {
                logger.debug(results)
                res.status(200).json({
                    status: 200,
                    message: `Meal succesfully edited.`,
                    data: req.body
                })
            }
        })
    })
});

router.get("", async (req, res) => {
    console.log(`GET /api/meal`)

    db.getConnection(function (err, connection) {
        const query = `SELECT * FROM meal;`
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
                    res.status(400).json({
                        status: 400,
                        message: error.message,
                        data: {}
                    })
                    return
                } else {
                    logger.debug(results)
                    res.status(200).json({
                        status: 200,
                        message: `Retrieved ${results.length} meals.`,
                        data: results
                    })
                }
            }
        )
    })
});

router.get("/:id", async (req, res) => {
    console.log(`GET /api/meal/:id`)

    db.getConnection(function (err, connection) {
        const query = `SELECT * FROM meal WHERE id = ${req.params.id};`
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
                    res.status(400).json({
                        status: 400,
                        message: error.message,
                        data: {}
                    })
                    return
                } else if (results.length == 0) {
                    console.log(`No results found for id`)
                    res.status(401).json({
                        status: 401,
                        message: "Meal could not be found for id " + req.params.id,
                        data: {}
                    })
                } else {
                    logger.debug(results)
                    res.status(200).json({
                        status: 200,
                        message: `Meal succesfully retrieved.`,
                        data: results[0]
                    })
                }
            }
        )
    })
});

router.delete("/:id", validateToken, async (req, res) => {
    console.log(`DELETE /api/meal/:id`)
    
    db.getConnection(function (err, connection) {
        const query = `SELECT cookid FROM meal WHERE id = ${req.params.id}`;
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()
                
                //If id doesnt exists
                if (results.length == 0) {
                    res.status(401).json({
                        status: 401,
                        message: `Mealid ${req.params.id} doesn't exists.`,
                        data: {}
                    })
                } else
                //Check if cookid matches authorization
                if (req.userId != results[0].cookid || results[0].cookId == "NULL") {
                    res.status(401).json({
                        status: 401,
                        message: "Userid " + req.userId + " is not authorized to edit this meal.",
                        data: {}
                    })
                } else {
                    let query2 = `DELETE FROM meal WHERE id = ${req.params.id}`

                    console.log(`Executing query on db: `)
                    console.log(query2) 
                    connection.query(query2, function (error, results, fields) {
                        connection.release()
                    
                        if (error) {
                            logger.error(error)
                            res.status(400).json({
                                status: 400,
                                message: error.message,
                                data: {}
                            })
                            return
                        } else {
                            logger.debug(results)
                            res.status(200).json({
                                status: 200,
                                message: `Meal succesfully deleted.`,
                                data: {}
                            })
                        }
                    })
                }
            }
        )
    })
});

module.exports = router