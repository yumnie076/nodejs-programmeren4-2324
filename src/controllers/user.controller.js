const userService = require('../services/user.service')

const userController = {
    create: (req, res, next) => {
        const user = req.body;

        if (
            !user.firstName || !user.lastName || !user.emailAddress ||
            !user.phoneNumber || !user.password || !user.roles
        ) {
            return next({
                status: 400,
                message: 'Missing required user fields.',
                data: {}
            });
        }

        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            res.status(201).json({
                status: 201,
                message: success.message,
                data: success.data
            });
        });
    },

    getAll: (req, res) => {
        const filters = req.query;
        userService.getAll(filters, (error, result) => {
            if (error) {
                return res.status(error.status || 400).json({ message: error.message });
            }
            res.status(200).json({
                status: 200,
                message: 'Users retrieved successfully',
                data: result
            });
        });
    },

    getById: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return next({ status: 400, message: 'Invalid user ID', data: {} });
        }

        userService.getById(userId, (error, success) => {
            if (error) return next(error);
            res.status(200).json({ status: 200, message: success.message, data: success.data });
        });
    },

    update: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        const userIdFromToken = req.userId;

        if (userId !== userIdFromToken) {
            return next({ status: 403, message: 'Je mag alleen je eigen profiel aanpassen.', data: {} });
        }

        const updatedData = req.body;
        if (!updatedData.firstName || !updatedData.lastName || !updatedData.emailAddress) {
            return next({
                status: 400,
                message: 'Missing required fields for update.',
                data: {}
            });
        }

        userService.update(userId, updatedData, (error, success) => {
            if (error) return next(error);
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            });
        });
    },

    delete: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        const userIdFromToken = req.userId;

        if (userId !== userIdFromToken) {
            return next({ status: 403, message: 'Je mag alleen je eigen account verwijderen.', data: {} });
        }

        userService.delete(userId, (error, success) => {
            if (error) return next(error);
            res.status(204).send();
        });
    },

    getProfile: (req, res, next) => {
        const userId = req.userId;

        userService.getProfile(userId, (error, result) => {
            if (error) {
                return res.status(error.status).json({
                    message: error.message,
                    data: {}
                });
            }
            res.status(200).json({
                message: 'Profile retrieved successfully.',
                data: result.data
            });
        });
    }
};

module.exports = userController;
