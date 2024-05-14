const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)

        // Deprecated: de 'oude' manier van werken, met de inmemory database
        // database.add(user, (err, data) => {
        //     if (err) {
        //         logger.info(
        //             'error creating user: ',
        //             err.message || 'unknown error'
        //         )
        //         callback(err, null)
        //     } else {
        //         logger.trace(`User created with id ${data.id}.`)
        //         callback(null, {
        //             message: `User created with id ${data.id}.`,
        //             data: data
        //         })
        //     }
        // })

        // Nieuwe manier van werken: met de MySQL database
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO `user` (firstName, lastName, emailAdress, password) VALUES (?, ?, ?, ?)',
                [user.firstName, user.lastName, user.email, user.password],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.trace(`User created with id ${results.insertId}.`)
                        callback(null, {
                            message: `User created with id ${results.insertId}.`,
                            data: {
                                id: results.insertId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email
                            }
                        })
                    }
                }
            )
        })
    },

    getAll: (callback) => {
        logger.info('getAll')

        // Deprecated: de 'oude' manier van werken, met de inmemory database
        // database.getAll((err, data) => {
        //     if (err) {
        //         callback(err, null)
        //     } else {
        //         callback(null, {
        //             message: `Found ${data.length} users.`,
        //             data: data
        //         })
        //     }
        // })

        // Nieuwe manier van werken: met de MySQL database
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user`',
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getById: (userId, callback) => {
        logger.info('getById userId:', userId)
    
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
    
            connection.query(
                'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()
    
                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.length === 0) {
                            callback({ status: 404, message: 'User not found' }, null)
                        } else {
                            logger.debug(results)
                            callback(null, {
                                status: 200,
                                message: `Found user with ID ${userId}.`,
                                data: results[0] // Pak het eerste resultaat, aangezien er maar 1 hoord te zijn.
                            })
                        }
                    }
                }
            )
        })
    },

    edit: (userId, userData, callback) => {
        logger.info('edit user', userData)

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            logger.info('UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ? WHERE id = ?',
            [userData.firstName, userData.lastName, userData.email, userData.password, userId])
            logger.info([userData.firstName, userData.lastName, userData.email, userData.password, userId])

            connection.query(
                'UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ? WHERE id = ?',
                [userData.firstName, userData.lastName, userData.email, userData.password, userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.affectedRows === 0) {
                            callback({ status: 404, message: 'User not found' }, null)
                        } else {
                            logger.trace(`User with id ${userId} edited successfully.`)
                            callback(null, {
                                status: 200,
                                message: `User with id ${userId} edited successfully.`,
                                data: {
                                    id: userId,
                                    firstName: userData.firstName,
                                    lastName: userData.lastName,
                                    email: userData.email
                                }
                            })
                        }
                    }
                }
            )
        })
    },

    delete: (userId, callback) => {
        logger.info('delete userId:', userId)

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM `user` WHERE id = ?',
                [userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.affectedRows === 0) {
                            callback({ status: 404, message: 'User not found' }, null)
                        } else {
                            logger.trace(`User with id ${userId} deleted successfully.`)
                            callback(null, {
                                status: 200,
                                message: `User with id ${userId} deleted successfully.`,
                                data: {}
                            })
                        }
                    }
                }
            )
        })
    }
}

module.exports = userService