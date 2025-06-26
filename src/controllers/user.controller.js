const userService = require('../services/user.service');

let userController = {
    create: (req, res) => {
        const user = req.body;
        console.log('Creating user:', user);
    
        userService.create(user, (error, success) => {
            if (error) {
                console.error('Create user error:', error);
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message || 'Internal server error',
                    data: {}
                });
            }
            res.status(success.status).json({
                status: success.status,
                message: success.message,
                data: success.data
            });
        });
    },

    getAll: (req, res) => {
        const filters = req.query;
        userService.getAll(filters, (error, success) => {
            if (error) {
                return res.status(error.status || 400).json({
                    status: error.status || 400,
                    message: error.message || 'Invalid filters',
                    data: {}
                });
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            });
        });
    },

    getById: (req, res) => {
        const userId = req.params.userId;
        userService.getById(userId, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message || 'Error occurred',
                    data: null
                });
            }
            if (success.data === null) {
                return res.status(404).json({
                    status: 404,
                    message: success.message,
                    data: null
                });
            }
            res.status(success.status).json({
                status: success.status,
                message: success.message,
                data: success.data
            });
        });
    },

    updateUser: (req, res) => {
        const userId = req.params.userId;
        const updatedUser = req.body;
        const authUserId = req.userId;

        

        userService.updateUser(userId, updatedUser, authUserId, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message || 'An error occurred',
                    data: {}
                });
            }
            if (!success.data) {
                return res.status(404).json({
                    status: 404,
                    message: success.message,
                    data: {}
                });
            }
            res.status(success.status).json({
                status: success.status,
                message: success.message,
                data: success.data
            });
        });
    },

    delete: (req, res) => {
        const userId = req.params.userId;
        const authUserId = req.userId;

        console.log(`Controller - authUserId: ${authUserId}, userId: ${userId}`);

        userService.delete(userId, authUserId, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message || 'An error occurred',
                    data: {}
                });
            }
            if (!success.data) {
                return res.status(404).json({
                    status: 404,
                    message: success.message,
                    data: {}
                });
            }
            res.status(success.status).json({
                status: success.status,
                message: success.message,
                data: success.data
            });
        });
    },

    getProfile: (req, res) => {
        const userId = req.userId;
        console.log('userId by controller', userId);
        userService.getProfile(userId, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message || 'An error occurred',
                    data: {}
                });
            }
            if (!success.data) {
                return res.status(404).json({
                    status: 404,
                    message: success.message,
                    data: {}
                });
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            });
        });
    }
};

module.exports = userController;
