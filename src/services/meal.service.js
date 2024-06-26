const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const db = require('../dao/mysql-db')

const mealService = {
    create: (meal, cookid, callback) => {
        logger.info('create meal', meal)

        db.getConnection(function (err, connection) {
            const query = `INSERT INTO meal VALUES (${meal.id}, ${meal.isactive},${meal.isvega},${meal.isvegan},${meal.istotakehome},'${meal.datetime}',${meal.maxamountofparticipants},${meal.price},'${meal.imageurl}', ${cookid}, NOW(), NOW(), "${meal.name}","${meal.description}",'${meal.allergenes}')`;
            console.log(`Executing query on db: `)
            console.log(query)
            connection.query(query,
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            status: 200,
                            message: `Meal succesfully inserted.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getAll: (callback) => {
        logger.info('getAll')

        db.getConnection(function (err, connection) {

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
                    callback(error, null)
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
                        roles: meal.cookRoles ? meal.cookRoles.split(',') : null, // Check if meal.cookRoles is not null before splitting
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
    
                callback(null, {
                    status: 200,
                    message: `Retrieved ${transformedResults.length} meals.`,
                    data: transformedResults
                });
            });
        });
    },

    getById: (mealId, callback) => {
        logger.info('getById userId:', mealId)
    
        db.getConnection(function (err, connection) {
            const query = `SELECT * FROM meal WHERE id = ${mealId};`
            console.log(`Executing query on db: `)
            console.log(query)
            connection.query(query,
                function (error, results, fields) {
                    connection.release()
    
                    if (error) {
                        logger.error(error)
                        callback(error, null)
                        return
                    } else if (results.length == 0) {
                        console.log(`No results found for id`)
                        callback(null, {
                            status: 401,
                            message: "Meal could not be found for id " + mealId,
                            data: {}
                        })
                    } else {
                        logger.debug(results)
                        callback(null, {
                            status: 200,
                            message: `Meal succesfully retrieved.`,
                            data: results[0]
                        })
                    }
                }
            )
        })
    },

    edit: (id, mealData, callback) => {
        logger.info('edit user', mealData)

        db.getConnection((err, connection) => {
            let query2 = `UPDATE meal SET 
            id = ${id}, isActive = ${mealData.isactive}, isVega = ${mealData.isvega}, isVegan = ${mealData.isvegan},
            isToTakeHome = ${mealData.istotakehome}, dateTime = '${mealData.datetime}', maxAmountOfParticipants = ${mealData.maxamountofparticipants},
            price = ${mealData.price}, imageUrl = '${mealData.imageurl}', updateDate = NOW(), name = "${mealData.name}", description = "${mealData.description}", allergenes = '${mealData.allergenes}'`;
                            
            // Add new cookid if specified
            if (mealData.cookid) {
                query2 = query2 + `, cookid = ${mealData.cookid}`
            }
    
            // Add where clause
            query2 = query2 + ` WHERE id = ${id};`
    
            console.log(`Executing query on db: `)
            console.log(query2) 
            connection.query(query2, function (error, results, fields) {
                connection.release()
            
                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    logger.debug(results)
                    callback(null, {
                        status: 200,
                        message: `Meal succesfully edited.`,
                        data: mealData
                    })
                }
            })
        })
    },

    delete: (mealId, callback) => {
        logger.info('delete mealId:', mealId)

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            let query2 = `DELETE FROM meal WHERE id = ${mealId}`

            console.log(`Executing query on db: `)
            console.log(query2) 
            connection.query(query2, function (error, results, fields) {
                connection.release()
            
                if (error) {
                    logger.error(error)
                    callback(error, null)
                    return
                } else {
                    logger.debug(results)
                    callback(null, {
                        status: 200,
                        message: `Meal succesfully deleted.`,
                        data: {}
                    })
                }
            })
        })
    }
}

module.exports = mealService