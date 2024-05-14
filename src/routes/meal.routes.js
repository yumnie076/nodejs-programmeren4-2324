
const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const { validateToken } = require('./authentication.routes')


router.post('/api/meals',validateToken, mealController.create);

router.get('/api/meals', mealController.getAll);

router.get('/api/meals/:mealId',validateToken, mealController.getById);

router.put('/api/meals/:mealId',validateToken, mealController.update);

router.delete('/api/meals/:mealId',validateToken, mealController.delete);

module.exports = router;


