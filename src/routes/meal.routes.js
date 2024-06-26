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
    } else {
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
    }
});

router.put("/:id", validateToken, async (req, res) => {
    console.log(`PUT /api/meal body:`)
    console.log(req.body)

    // Validate fields
    const {
       datetime, maxamountofparticipants, price,
       imageurl, name, description
    } = req.body

    const id = req.params.id
    const cookid = req.body.cookid || "NULL";
    const isactive = req.body.isactive || 0;
    const isvega = req.body.isvega || 0;
    const isvegan = req.body.isvegan || 0;
    const istotakehome = req.body.istotakehome || 0;
    const allergenes = req.body.allergenes || "";

    if (
        !id ||  !datetime || !maxamountofparticipants || !price ||
        !imageurl || !name || !description 
    ) {
        res.status(400).json({
            status: 400,
            message: "Fields are missing",
            data: {}
        })
    } else {
        db.getConnection(function (err, connection) {
            const query = `SELECT cookid FROM meal WHERE id = ${id}`;
            console.log(`Executing query on db: `)
            console.log(query)
            connection.query(query,
                function (error, results, fields) {
                    connection.release()
                    
                    if (results.length == 0) {
                        res.status(400).json({
                            status: 400,
                            message: "Meal is missing",
                            data: {}
                        })
                    } else {
                        console.log(req.userId + " " + results[0].cookid)
                        console.log(results[0].cookid == "null")
                        //Check if cookid matches authorization
                        if (req.userId !== results[0].cookid && results[0].cookid !== null) {
                            res.status(401).json({
                                status: 401,
                                message: "Userid " + req.userId + " is not authorized to edit this meal.",
                                data: {}
                            })
                        } else {
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
                        }
                    }
                }
            )
        })
    }
});

router.get("", async (req, res) => {
    console.log(`GET /api/meal`);

    const query = `
        SELECT meal.*, 
               user.id AS userId,
               user.firstName AS cookFirstName,
               user.lastName AS cookLastName,
               user.isActive AS cookIsActive,
               user.emailAdress AS cookEmail,
               user.phoneNumber AS cookPhoneNumber,
               user.roles AS cookRoles,
               user.street AS cookStreet,
               user.city AS cookCity
        FROM meal
        LEFT JOIN user ON meal.cookId = user.id;
    `;

    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).json({
                status: 500,
                message: 'Database connection error',
                data: {}
            });
            return;
        }

        console.log(`Executing query on db: `);
        console.log(query);

        connection.query(query, function (error, results, fields) {
            connection.release();

            if (error) {
                console.error('Error executing query:', error);
                res.status(500).json({
                    status: 500,
                    message: 'Database query error',
                    data: {}
                });
                return;
            }

            console.log('Retrieved meals:', results.length);

            // Transforming results to include cook object with all user details
            const transformedResults = results.map(meal => {
                const cook = {
                    id: meal.userId,
                    firstName: meal.cookFirstName,
                    lastName: meal.cookLastName,
                    isActive: meal.cookIsActive,
                    email: meal.cookEmail,
                    phoneNumber: meal.cookPhoneNumber,
                    roles: meal.cookRoles.split(','), // Convert roles string to array
                    street: meal.cookStreet,
                    city: meal.cookCity
                    // Add other user fields as needed
                };
                delete meal.userId; // Remove userId from meal object
                delete meal.cookFirstName; // Remove cookFirstName from meal object
                delete meal.cookLastName; // Remove cookLastName from meal object
                delete meal.cookIsActive; // Remove cookIsActive from meal object
                delete meal.cookEmail; // Remove cookEmail from meal object
                delete meal.cookPhoneNumber; // Remove cookPhoneNumber from meal object
                delete meal.cookRoles; // Remove cookRoles from meal object
                delete meal.cookStreet; // Remove cookStreet from meal object
                delete meal.cookCity; // Remove cookCity from meal object
                meal.cook = cook; // Add cook object to meal
                return meal;
            });

            res.status(200).json({
                status: 200,
                message: `Retrieved ${transformedResults.length} meals.`,
                data: transformedResults
            });
        });
    });
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
                if (req.userId != results[0].cookid && results[0].cookId !== null) {
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