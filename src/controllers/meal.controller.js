
const mealService = require('../services/meal.service');
const logger = require('../util/logger');

let mealController = {
    getAllMeals: (req, res, next) => {
        mealService.getAllMeals((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getMealById: (req, res, next) => {
        const mealId = parseInt(req.params.mealId, 10);
        mealService.getMealById(mealId, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    deleteMeal: (req, res, next) => {
        const mealId = parseInt(req.params.mealId, 10);
        const userId = req.userId; // Zorg ervoor dat je de userId hebt vanuit je auth middleware.
    
        mealService.deleteMeal(mealId, userId, (error, success) => {
            if (error) {
                return res.status(error.status || 500).json({
                    status: error.status || 500,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    createMeal: (req, res, next) => {
        const mealData = req.body;
        mealData.cookId = req.userId; // Stel de cookId in als de ingelogde gebruiker
    
        mealService.createMeal(mealData, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    updateMeal: (req, res, next) => {
        const mealId = req.params.mealId;
        const updatedMeal = req.body;
        const authUserId = req.userId;  // Extracted from validateToken middleware
    
        console.log(`authUserId from token: ${authUserId}, mealId: ${mealId}, updatedMeal: ${JSON.stringify(updatedMeal)}`);
    
        mealService.updateMeal(mealId, updatedMeal, authUserId, (error, success) => {
            if (error) {
                return next({
                    status: error.status || 500,
                    message: error.message || 'An error occurred',
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: `Meal with id ${mealId} successfully updated.`,
                    data: success.data
                });
            } else {
                res.status(404).json({
                    status: 404,
                    message: `Meal with id ${mealId} not found.`,
                    data: {}
                });
            }
        });
    }
    
    
    
}
module.exports = mealController
