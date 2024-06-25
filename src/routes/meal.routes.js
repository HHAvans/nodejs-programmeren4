const express = require('express')
const router = express.Router()
const validateToken = require('./authentication.routes').validateToken
const db = require('../dao/mysql-db')
const logger = require('../util/logger')

router.post("/add", validateToken, async (req, res) => {
    console.log(`POST /api/meal/add`)
    console.log(`Body: ${req.body}`)

    // Validate fields
    const {
       id, isactive, isvega, isvegan, istotakehome,
       datetime, maxamountofparticipants, price,
       imageurl, name, description, allergenes  
    } = req.body

    const cookid = req.body.cookid || "NULL";

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
        const query = `INSERT INTO meal VALUES (${id}, ${isactive},${isvega},${isvegan},${istotakehome},'${datetime}',${maxamountofparticipants},${price},'${imageurl}', ${cookid}, '2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000', "${name}","${description}",'${allergenes}')`;
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
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

module.exports = router