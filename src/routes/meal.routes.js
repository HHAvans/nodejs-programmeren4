const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const validateToken = require('./authentication.routes').validateToken
const logger = require('../util/logger')

const db = require('../dao/mysql-db')

const validaiteAuthentication = (req, res, next) => {
    db.getConnection(function (err, connection) {
        const query = `SELECT cookid FROM meal WHERE id = ${req.params.id}`;
        console.log(`Executing query on db: `)
        console.log(query)
        connection.query(query,
            function (error, results, fields) {
                connection.release()
                
                //If id doesnt exists
                if (results.length == 0) {
                    next({
                        status: 401,
                        message: `Mealid ${req.params.id} doesn't exists.`,
                        data: {}
                    })
                } else
                //Check if cookid matches authorization
                if (req.userId != results[0].cookid && results[0].cookid !== null) {
                    next({
                        status: 401,
                        message: "Userid " + req.userId + " is not authorized to edit this meal.",
                        data: {}
                    })
                } else {
                    next()
                }
            }
        )
    })
}

const validateFieldsForCreate = (req, res, next) => {

    const {
        id, isactive, isvega, isvegan, istotakehome,
        datetime, maxamountofparticipants, price,
        imageurl, name, description, allergenes  
    } = req.body

    if (
        !id, !isactive || !isvega || !isvegan || !istotakehome ||
        !datetime || !maxamountofparticipants || !price ||
        !imageurl || !name || !description || !allergenes
    ) {
        next({
            status: 400,
            message: "Fields are missing",
            data: {}
        })
    } else {
        next()
    }
}

const validateFieldsForEdit = (req, res, next) => {

    const {
        datetime, maxamountofparticipants, price,
        imageurl, name, description
    } = req.body

    const id = req.params.id

    if (
        !id ||  !datetime || !maxamountofparticipants || !price ||
        !imageurl || !name || !description 
    ) {
        next({
            status: 400,
            message: "Fields are missing",
            data: {}
        })
    } else {
        next()
    }
}


// Mealroutes
router.post('/api/meal', validateToken, validateFieldsForCreate, mealController.create) // Create meal
router.get('/api/meal', mealController.getAll) // Get all meals
router.get('/api/meal/:id', mealController.getById) // Get meal with id
router.put('/api/meal/:id', validateToken, validateFieldsForEdit, validaiteAuthentication, mealController.edit) // Edit meal by id
router.delete('/api/meal/:id', validateToken, validaiteAuthentication, mealController.delete) // Delete meal by id

module.exports = router