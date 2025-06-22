const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validateToken } = require('./authentication.routes');

// Validators
const assert = require('assert');

const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAddress, 'Missing email');
        assert(req.body.firstName, 'Missing first name');
        assert(req.body.lastName, 'Missing last name');
        assert(
            req.body.emailAddress.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
            'Invalid email address'
        );
        next();
    } catch (ex) {
        next({ status: 403, message: ex.message, data: {} });
    }
};

// Routes
router.post('/api/user', validateUserCreateAssert, userController.create);
router.get('/api/user', userController.getAll);
router.get('/api/user/profile', validateToken, userController.getProfile);
router.get('/api/user/:userId', validateToken, userController.getById);
router.put('/api/user/:userId', validateToken, userController.update);
router.delete('/api/user/:userId', validateToken, userController.delete);

module.exports = router;
