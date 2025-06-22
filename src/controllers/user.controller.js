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
            status: 201,
            message: success.message,
            data: success.data
          })
        }
      });
    },
  
    // Haal alle gebruikers op en filter op basis van parameters
    getAll: (req, res) => {
        const filters = req.query;  // Directly using all query parameters as filters
    
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
            status: 200,
            message: success.message,
            data: success.data
          })
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
            status: 200,
            message: success.message,
            data: success.data
          })
        }
      });
    },
    
    getProfile: (req, res, next) => {
        const userId = parseInt(req.userId);
    
        if (!userId) {
            return res.status(400).json({
                message: 'Invalid user ID',
                data: {}
            });
        }
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

