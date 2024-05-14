const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const validateToken = require('./authentication.routes').validateToken
const logger = require('../util/logger')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

const validateUserCreate = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        chai.expect(req.body.firstName).to.not.be.empty
        chai.expect(req.body.firstName).to.be.a('string')
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        )
        logger.trace('User successfully validated')
        next()
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Userroutes
router.post('/api/user', validateUserCreate, userController.create) // Create user
router.get('/api/user', userController.getAll) // Get all users
router.get('/api/user/profile', validateToken, userController.getProfile) // Get profile of currently logged in user
router.get('/api/user/:userId', userController.getById) // Get user with user id
router.put('/api/user/:userId', validateUserCreate, userController.edit) // Put new user in existing id
router.delete('/api/user/:userId', userController.delete) // Delete user by id

module.exports = router