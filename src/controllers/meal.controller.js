
const mealService = require('../services/meal.service');
const logger = require('../util/logger');

const mealController = {
  // Maak een maaltijd aan
  create: (req, res, next) => {
    const meal = req.body;

    // Basisvalidatie van verplichte velden
    if (!meal.name || !meal.description || !meal.price || !meal.cookId) {
      return res.status(401).json({
        status: 401,
        message: 'Missing required fields: name, description, price, and cookId are required.',
        data: {}
      });
    }

    mealService.create(meal, (error, success) => {
      if (error) {
        return next({
          status: error.status || 500,
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

  // Haal alle maaltijden op
  getAll: (req, res, next) => {
    mealService.getAll((error, success) => {
      if (error) {
        return next({
          status: error.status || 500,
          message: error.message,
          data: {}
        });
      }
      res.status(200).json({
        status: 200,
        message: 'Meals retrieved successfully.',
        data: success.data
      });
    });
  },

  // Haal een maaltijd op basis van ID
  getById: (req, res, next) => {
    const mealId = parseInt(req.params.mealId);
    if (isNaN(mealId)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid meal ID',
        data: {}
      });
    }

    mealService.getById(mealId, (error, success) => {
      if (error) {
        if (error.message.includes('Meal not found')) {
          return res.status(404).json({
            status: 404,
            message: 'Meal does not exist.',
            data: {}
          });
        }
        return next({
          status: error.status || 500,
          message: error.message,
          data: {}
        });
      }
      res.status(200).json({
        status: 200,
        message: 'Meal details retrieved successfully.',
        data: success.data
      });
    });
  },

  // Update een maaltijd op basis van ID
  update: (req, res, next) => {
    const mealId = parseInt(req.params.mealId);
    if (isNaN(mealId)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid meal ID',
        data: {}
      });
    }

    const updatedMeal = req.body;
    if (!updatedMeal.name || !updatedMeal.description || !updatedMeal.price) {
      return res.status(400).json({
        status: 400,
        message: 'Missing required fields for update: name, description, and price.',
        data: {}
      });
    }

    mealService.update(mealId, updatedData, (error, success) => {
      if (error) {
        if (error.message.includes('not the owner')) {
          return res.status(403).json({
            status: 403,
            message: 'Not the owner of the data.',
            data: {}
          });
        }
        if (error.message.includes('Meal not found')) {
          return res.status(404).json({
            status: 404,
            message: 'Meal does not exist.',
            data: {}
          });
        }
        return next({
          status: error.status || 500,
          message: error.message,
          data: {}
        });
      }
      res.status(200).json({
        status: 200,
        message: 'Meal successfully updated.',
        data: success.data
      });
    });
  },

  // Verwijder een maaltijd op basis van ID
  delete: (req, res, next) => {
    const mealId = parseInt(req.params.mealId, 10);
    const userId = req.userId; // Extract userId from token (provided by validateToken)
    console.log("userId", userId);
    console.log("mealId", mealId);
 
    mealService.getById(mealId, (error, meal) => {
      if (error) {
        return res.status(400).json({
          status: 400,
          message: 'Invalid meal ID',
          data: {},
        });
      }
 
      // Ensure that only the creator (cook) can delete their own meal
      if (mealId !== userId) {
        // console.log("meal.cookId", meal.cookId);
        // console.log("userId", userId);
        return next({
          status: 403,
          message: "You are not authorized to delete this meal.",
          data: {},
        });
      }
 
      mealService.delete(mealId, (error, success) => {
        if (error) {
          if (error.message.includes('Meal not found')) {
            return res.status(404).json({
              status: 404,
              message: 'Meal does not exist.',
              data: {}
            });
          }
          if (error.message.includes('not the owner')) {
            return res.status(403).json({
              status: 403,
              message: 'Not the owner of the data.',
              data: {}
            });
          }
          return next({
            status: error.status || 500,
            message: error.message,
            data: {}
          });
        }
        res.status(200).json({
          status: 200,
          message: `Meal with ID ${mealId} successfully deleted.`,
          data: {}
        });
      });
    }
  );
}
}


module.exports = mealController;
