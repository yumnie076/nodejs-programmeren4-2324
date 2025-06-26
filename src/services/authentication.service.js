// Desc: Authentication service for user login and registration
const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
// const validateEmail = require('../util/emailvalidator')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey
const database = require('../dao/database');

const authService = {

    login: (username, password, callback) => {
        database.login(username, password, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                if (data) {
                    callback(null, {
                        message: `User authenticated successfully.`,
                        data: data,
                        status: 200
                    })
                } else {
                    callback(null, {
                        message: `Invalid username or password.`,
                        data: null,
                        status: 400
                    })
                }
            }
        })
    }
}

module.exports = authService
