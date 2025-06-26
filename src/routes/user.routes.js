const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const database = require('../dao/database') 
const userService = require('../services/user.service')
const { validateToken } = require('../routes/auth.routes');

// Importeer de juiste database-module of -object





// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    res.status(404).json({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

// Input validation function 1
const validateEmailPresence = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing email');
        next();
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};



// Input validation function 2 met gebruik van assert
const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing email')
        assert(req.body.firstName, 'Missing first name')
        assert(req.body.lastName, 'Missing last name')
        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}


const validateEmail = (req, res, next) => {
    try {
        const email = req.body.emailAdress;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email address');
        }
        next();
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};


const validateUniqueEmail = (req, res, next) => {
    const email = req.body.emailAdress;
    database.getUserByEmail(email, (err, existingUser) => {
        if (err) {
            return res.status(500).json({
                status: 500,
                message: err.message,
                data: {}
            });
        }
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: 'User already exists',
                data: {}
            });
        }
        next();
    });
}; 

const validatePassword = (req, res, next) => {
    try {
        const password = req.body.password;
        if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            throw new Error('Invalid password. Password must be at least 8 characters long, contain at least 1 uppercase letter, and at least 1 digit.');
        }
        next();
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};

const validatePhoneNumber = (req, res, next) => {
    try {
        const phoneNumber = req.body.phoneNumber;
        if (phoneNumber && (!/^(06)\d{8}$/.test(phoneNumber))) {
            throw new Error('Invalid phone number. Phone number must start with 06 and have 10 digits.');
        }
        next();
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};



// Userroutes
router.post('/api/user', validateUserCreateAssert, validateEmail, validateUniqueEmail, validatePassword, validatePhoneNumber, userController.create)
router.get('/api/user', validateToken, userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateToken, userController.getById)


// Tijdelijke routes om niet bestaande routes op te vangen (tests)
router.put('/api/user/:userId', validateEmail, validateToken, validatePhoneNumber, userController.update)

router.delete('/api/user/:userId', validateToken, userController.delete)

module.exports = router

