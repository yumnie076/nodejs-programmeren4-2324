const database = require('../dao/database');
const logger = require('../util/logger');

const mealService = {
    
    getAllMeals: (callback) => {
        database.getAllMeals((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                console.log(data)
                callback(null, {
                    message: `Found ${data.length} meals.`,
                    data: data
                })
            }
        })
    },

    getMealById: (id, callback) => {
        database.getMealById(id, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                if (data) {
                    callback(null, {
                        message: `Found meal with ID ${id}.`,
                        data: data
                    });
                } else {
                    callback({
                        status: 404,
                        message: `Meal with ID ${id} not found.`
                    }, null);
                }
            }
        });
    },

    deleteMeal: (mealId, userId, callback) => {
        database.getCookIdByMealId(mealId, (err, cookId) => {
            if (err) {
                callback(err, null);
            } else if (cookId !== userId) {
                callback({ status: 403, message: "Forbidden: You can only delete your own meals" }, null);
            } else {
                database.deleteMeal(mealId, (err, data) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, {
                            message: `Meal with ID ${mealId} deleted successfully.`,
                            data: data
                        });
                    }
                });
            }
        });
    },

    createMeal: (meal, callback) => {
        database.createMeal(meal, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Meal created with ID ${data.id}.`,
                    data: data
                })
            }
        })
    },

    updateMeal: (id, updatedMeal, authUserId, callback) => {
        console.log(`authUserId: ${authUserId}, mealId: ${id}`); // Log the IDs for debugging
    
        // Assuming cookId is supposed to be the ID of the user who created the meal.
        database.getMealById(id, (err, meal) => {
            if (err) {
                return callback({ status: 500, message: 'Error fetching meal' }, null);
            }
            if (!meal) {
                return callback({ status: 404, message: `Meal with ID ${id} not found` }, null);
            }
    
            const cookId = meal.cookId;  // Assuming the meal has a `cookId` property
            if (parseInt(cookId) !== parseInt(authUserId)) {
                return callback({ status: 403, message: 'Forbidden: You can only update your own data' }, null);
            }
    
            database.updateMeal(id, updatedMeal, (err, data) => {
                if (err) {
                    callback({ status: 400, message: err.message }, null);
                } else {
                    if (data) {
                        callback(null, {
                            status: 200,
                            message: `Meal updated with id ${id}.`,
                            data: data
                        });
                    } else {
                        callback({
                            status: 404,
                            message: `Meal not found with id ${id}.`,
                            data: null
                        }, null);
                    }
                }
            });
        });
    }
    
    
    
}

module.exports = mealService