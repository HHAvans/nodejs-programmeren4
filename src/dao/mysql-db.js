const mysql = require('mysql2')
const logger = require('../util/logger')
require('dotenv').config()

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    connectionLimit: 10,
    waitForConnections: true,
    multipleStatements: false, // Adjust based on your needs
    enableKeepAlive: true,
}

logger.trace(dbConfig)

let pool
try {
    pool = mysql.createPool(dbConfig)
} catch (err) {
    logger.error('Error creating MySQL pool:', err.message)
    process.exit(1) // Exit application or handle error appropriately
}

pool.on('connection', function (connection) {
    logger.trace(
        `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
    )
})

pool.on('acquire', function (connection) {
    logger.trace('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    logger.trace('Connection %d released', connection.threadId)
})

pool.on('error', function (err) {
    logger.error('MySQL Pool Error:', err.message)
    // Optionally, handle error by destroying the pool and re-creating it
})

module.exports = pool