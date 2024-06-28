const { query } = require('express')
const userService = require('../services/meal.service')
const logger = require('../util/logger')

let mealController = {
    create: (req, res, next) => {
        const meal = req.body
        logger.info('create meal')
        userService.create(meal, req.userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace('getAllMeals')
        userService.getAll((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getById: (req, res, next) => {
        logger.trace('mealController: getById')
        userService.getById(req.params.id, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(success.status).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    edit: (req, res, next) => {
        const mealId = req.params.id

        let jsonObj = req.body

        jsonObj["cookid"] = req.body.cookid || "NULL";
        jsonObj["isactive"] = req.body.isactive || 0;
        jsonObj["isvega"] = req.body.isvega || 0;
        jsonObj["isvegan"] = req.body.isvegan || 0;
        jsonObj["istotakehome"] = req.body.istotakehome || 0;
        jsonObj["allergenes"] = req.body.allergenes || "";
        
        logger.info('edit meal')
        logger.info(jsonObj)
        userService.edit(mealId, jsonObj, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    delete: (req, res, next) => {
        const mealId = req.params.id
        logger.info('delete meal', mealId)
        userService.delete(mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    }
}

module.exports = mealController
