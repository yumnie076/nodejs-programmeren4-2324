
const pool = require('../../mysql-pool');
const logger = require('../util/logger');

const mealService = {
  // Maak een nieuwe maaltijd aan
  create: (meal, callback) => {
    const query = `
      INSERT INTO \`meal\` (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, allergenes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      meal.name,
      meal.description,
      meal.isActive || 1,
      meal.isVega || 0,
      meal.isVegan || 0,
      meal.isToTakeHome || 1,
      meal.dateTime,
      meal.maxAmountOfParticipants,
      meal.price,
      meal.imageUrl || '',
      meal.cookId,
      meal.allergenes || ''
    ];

    pool.query(query, values, (err, results) => {
      if (err) {
        logger.error('Error creating meal:', err);
        return callback({
          status: 500,
          message: 'Database error'
        }, null);
      }

      callback(null, {
        status: 201,
        message: `Meal created`,
        data: { id: results.insertId }
      });
    });
  },

  // Haal alle maaltijden op
  getAll: (callback) => {
    const query = 'SELECT * FROM `meal`';

    pool.query(query, (err, results) => {
      if (err) {
        logger.error('Error fetching meals:', err);
        return callback({
          status: 500,
          message: 'Database error'
        }, null);
      }

      callback(null, {
        status: 200,
        message: `Found ${results.length} meals`,
        data: results
      });
    });
  },

  // Haal maaltijd op basis van ID
  getById: (mealId, callback) => {
    const query = 'SELECT * FROM `meal` WHERE `id` = ?';

    pool.query(query, [mealId], (err, results) => {
      if (err || results.length === 0) {
        logger.error('Error fetching meal:', err || 'Meal not found');
        return callback({
          status: 404,
          message: `Meal not found with id ${mealId}`
        }, null);
      }

      callback(null, {
        status: 200,
        message: `Found meal with id ${mealId}`,
        data: results[0]
      });
    });
  },

  // Update een maaltijd
  update: (mealId, updatedMeal, callback) => {
    const query = `
      UPDATE \`meal\` SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, cookId = ?, allergenes = ?
      WHERE id = ?
    `;
    const values = [
      updatedMeal.name,
      updatedMeal.description,
      updatedMeal.isActive || 1,
      updatedMeal.isVega || 0,
      updatedMeal.isVegan || 0,
      updatedMeal.isToTakeHome || 1,
      updatedMeal.dateTime,
      updatedMeal.maxAmountOfParticipants,
      updatedMeal.price,
      updatedMeal.imageUrl || '',
      updatedMeal.cookId,
      updatedMeal.allergenes || '',
      mealId
    ];

    pool.query(query, values, (err, results) => {
      if (err || results.affectedRows === 0) {
        logger.error('Error updating meal:', err || 'Meal not found');
        return callback({
          status: 404,
          message: `Meal not found with id ${mealId}`
        }, null);
      }

      callback(null, {
        status: 200,
        message: `Meal updated with id ${mealId}`,
        data: updatedMeal
      });
    });
  },

  // Verwijder een maaltijd
  delete: (mealId, callback) => {
    const query = 'DELETE FROM `meal` WHERE `id` = ?';

    pool.query(query, [mealId], (err, results) => {
      if (err || results.affectedRows === 0) {
        logger.error('Error deleting meal:', err || 'Meal not found');
        return callback({
          status: 404,
          message: `Meal not found with id ${mealId}`
        }, null);
      }

      callback(null, {
        status: 204,
        message: `Meal deleted with id ${mealId}`
      });
    });
  }
};

module.exports = mealService;
