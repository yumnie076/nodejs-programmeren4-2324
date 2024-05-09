const userService = require('../services/user.service')

const userController = {
    // Maak een gebruiker aan
    create: (req, res, next) => {
      const user = req.body;
  
      // Basisvalidatie voor de gebruikersinput
      if (
        !user.firstName || !user.lastName || !user.emailAddress || 
        !user.phoneNumber || !user.password || !user.roles
      ) {
        return next({
          status: 400,
          message: 'Missing required user fields: firstName, lastName, emailAddress, phoneNumber, password, and roles are required.',
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
        if (success) {
          res.status(201).json({
            status: success.status,
            message: success.message,
            data: success.data
          });
        }
      });
    },
  
    // Haal alle gebruikers op
    getAll: (req, res, next) => {
      userService.getAll((error, success) => {
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
  
    // Haal gebruiker op basis van ID
    getById: (req, res, next) => {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return next({
          status: 400,
          message: 'Invalid user ID',
          data: {}
        });
      }
  
      userService.getById(userId, (error, success) => {
        if (error) {
          return next({
            status: error.status,
            message: error.message,
            data: {}
          });
        }
        if (success) {
          res.status(200).json({
            status: success.status,
            message: success.message,
            data: success.data
          });
        }
      });
    },
  
    // Update gebruiker op basis van ID
    update: (req, res, next) => {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return next({
          status: 400,
          message: 'Invalid user ID',
          data: {}
        });
      }
  
      const updatedData = req.body;
      // Basisvalidatie voor de update
      if (!updatedData.firstName || !updatedData.lastName || !updatedData.emailAddress) {
        return next({
          status: 400,
          message: 'Missing required fields for update: firstName, lastName, and emailAddress.',
          data: {}
        });
      }
  
      userService.update(userId, updatedData, (error, success) => {
        if (error) {
          return next({
            status: error.status,
            message: error.message,
            data: {}
          });
        }
        if (success) {
          res.status(200).json({
            status: success.status,
            message: success.message,
            data: success.data
          });
        }
      });
    },
  
    // Verwijder gebruiker op basis van ID
    delete: (req, res, next) => {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return next({
          status: 400,
          message: 'Invalid user ID',
          data: {}
        });
      }
  
      userService.delete(userId, (error, success) => {
        if (error) {
          return next({
            status: error.status,
            message: error.message,
            data: {}
          });
        }
        if (success) {
          res.status(204).send();
        }
      });
    }
  };

module.exports = userController

