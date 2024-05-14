// Desc: Authentication service for user login and registration
const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
// const validateEmail = require('../util/emailvalidator')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey

const authController = {
    login: (userCredentials, callback) => {
        logger.debug('login');

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err);
                callback({ status: 500, message: err.message }, null);
            }
            if (connection) {
                connection.query(
                    'SELECT `id`, `emailAddress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAddress` = ?',
                    [userCredentials.emailAddress],
                    (err, rows, fields) => {
                        connection.release();
                        if (err) {
                            logger.error('Error: ', err.toString());
                            callback({ status: 401, message: err.message }, null);
                        }
                        if (rows && rows.length === 1) {
                            if (rows[0].password == userCredentials.password) {
                                logger.debug('passwords DID match, sending userinfo and valid token');
                                const { password, ...userinfo } = rows[0];
                                const payload = {
                                    userId: userinfo.id
                                };

                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '12d' },
                                    function (err, token) {
                                        if (err) {
                                            callback({ status: 500, message: 'Failed to sign token' }, null);
                                        } else {
                                            callback(null, {
                                                status: 200,
                                                message: 'Gebruiker succesvol ingelogd',
                                                data: { ...userinfo, token }
                                            });
                                        }
                                    }
                                );
                            } else {
                                logger.info('User not found or password invalid');
                                callback({ status: 401, message: 'User not found or password invalid' }, null);
                            }
                        } else {
                            callback({ status: 404, message: 'Gebruiker bestaat niet' }, null);
                        }
                    }
                );
            }
        });
    }
};

module.exports = authController
