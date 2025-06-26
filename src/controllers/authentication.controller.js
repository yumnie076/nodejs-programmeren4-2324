const logger = require('../util/logger')
const authService = require('../services/authentication.service')

let authController = {
    login: (req, res) => {
        const { emailAdress, password } = req.body;

        authService.login(emailAdress, password, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message || 'Login failed',
                    data: {}
                });
            }

            res.status(success.status).json({
                status: success.status,
                message: success.message,
                data: success.data
            });
        });
    }
};

module.exports = authController;
