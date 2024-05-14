const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const { validateToken } = require('./authentication.routes')
const userController = require('../controllers/user.controller')
const logger = require('../util/logger')



// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

// Input validation functions for user routes
const validateUserCreate = (req, res, next) => {
    if (!req.body.emailAddress || !req.body.firstName || !req.body.lastName) {
        next({
            status: 400,
            message: 'Missing email or password',
            data: {}
        })
    }
    next()
}

// Input validation function 2 met gebruik van assert
const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAddress, 'Missing email')
        assert(req.body.firstName, 'Missing or incorrect first name')
        assert(req.body.lastName, 'Missing last name')
        // validate email format
        assert(
            req.body.emailAddress.match(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            ),
            "Invalid email address"
          );
        next()
    } catch (ex) {
        next({
            status: 403,
            message: ex.message,
            data: {}
        })
    }
}


// Userroutes

router.post('/api/user', validateUserCreateAssert, userController.create)

router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user', userController.getAll)
router.get('/api/user/:userId',validateToken, userController.getById)
router.put('/api/user/:userId', validateToken,userController.update)
router.delete('/api/user/:userId', validateToken,userController.delete)



module.exports = router
