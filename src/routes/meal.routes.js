
const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const { validateToken } = require('./authentication.routes')

// Route om een nieuwe maaltijd aan te maken
router.post('/api/meals',validateToken, mealController.create);

// Route om alle maaltijden op te halen
router.get('/api/meals', mealController.getAll);

// Route om een enkele maaltijd op te halen via ID
router.get('/api/meals/:mealId',validateToken, mealController.getById);

// Route om een maaltijd te updaten via ID
router.put('/api/meals/:mealId',validateToken, mealController.update);

// Route om een maaltijd te verwijderen via ID
router.delete('/api/meals/:mealId',validateToken, mealController.delete);

module.exports = router;


