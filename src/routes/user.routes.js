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
        assert(req.body.lastName, 'Missing or incorrect lastName field')
        assert(req.body.email, 'Missing or incorrect email field')
        assert(req.body.password, 'Missing or incorrect password field')
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

const validateUserEdit = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        assert(req.body.lastName, 'Missing or incorrect lastName field')
        assert(req.body.email, 'Missing or incorrect email field')
        assert(req.body.password, 'Missing or incorrect password field')
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

const validateInput = (req, res, next) => {

    const beforeAt = (req.body.email).split('@')[0]
    const afterAt = (req.body.email).split('@')[1]
    // Validate email format
    if (!(req.body.email).includes("@") || beforeAt.split('.')[0].length > 1 || beforeAt.split('.')[1].length < 2 || afterAt.split('.')[0].length < 2 || (afterAt.split('.')[1].length < 2 || afterAt.split('.')[1].length > 3)) {
        const error = new Error('Invalid email address');
        logger.error(error);
        next({
            status: 400,
            message: error.message,
            data: {}
        })
        return;
    }

    // Validate password length
    if (req.body.password.length < 8) {
        const error = new Error('Password must be at least 8 characters long');
        logger.error(error);
        next({
            status: 400,
            message: error.message,
            data: {}
        })
        return
    }
    next()
}

const validateAuthorization = (req, res, next) => {
    //Check if cookid matches authorization
    if (req.params.id != req.userId) {
        next({
            status: 401,
            message: "Userid " + req.userId + " is not authorized to edit this user.",
            data: {}
        })
    }
    next()
}

// Userroutes
router.post('/api/user', validateUserCreate, validateInput, userController.create) // Create user
router.get('/api/user', userController.getAll) // Get all users
router.get('/api/user/profile', validateToken, userController.getProfile) // Get profile of currently logged in user
router.get('/api/user/:userId', userController.getById) // Get user with user id
router.put('/api/user/:id', validateToken, validateAuthorization, validateUserEdit, validateInput, userController.edit) // Put new user in existing id
router.delete('/api/user/:id', validateToken, validateAuthorization, userController.delete) // Delete user by id

module.exports = router