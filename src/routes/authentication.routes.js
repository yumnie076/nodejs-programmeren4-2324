const express = require('express');
const routes = express.Router();
const jwt = require('jsonwebtoken');
const assert = require('assert');
const AuthController = require('../controllers/authentication.controller');
const logger = require('../util/logger');
const jwtSecretKey = require('../util/config').secretkey;

function validateLogin(req, res, next) {
    try {
        assert(typeof req.body.emailAddress === 'string', 'email must be a string.');
        assert(typeof req.body.password === 'string', 'password must be a string.');
        next();
    } catch (ex) {
        next({ status: 409, message: ex.toString(), data: {} });
    }
}

function validateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next({ status: 401, message: 'Authorization header missing!', data: {} });
    }
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

    if (!token) {
        return next({ status: 401, message: 'Authorization header missing!', data: {} });
    }

    jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
            return next({ status: 401, message: 'Not authorized!', data: {} });
        }
        req.userId = payload.userId;
        next();
    });
}



routes.post('/login', validateLogin, AuthController.login);

module.exports = { routes, validateToken };
