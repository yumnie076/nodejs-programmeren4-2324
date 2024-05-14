const { get } = require('../..')
const database = require('../dao/inmem-db')
const logger = require('../util/logger')
const pool = require('../../mysql-pool')



const userService = {
    // Maak een nieuwe gebruiker aan
    create: (user, callback) => {
      const query = `
        INSERT INTO \`user\` (firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        user.firstName,
        user.lastName,
        user.isActive || 1,
        user.emailAddress,
        user.password || 'secret',
        user.phoneNumber || '06-12345678',
        user.roles || 'editor,guest',
        user.street || '',
        user.city || ''
      ];


      pool.query(query, values, (err, results) => {
        if (err) {
          logger.info('Error creating user:', err.message || 'unknown error');
          return callback({
            status: 500,
            message: 'Server error'
          }, null);
        }
  
        const newUser = {
          id: results.insertId,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          emailAddress: user.emailAddress,
          phoneNumber: user.phoneNumber,
          roles: user.roles,
          street: user.street,
          city: user.city
        };
  
        logger.trace(`User created with id ${newUser.id}.`);
        callback(null, {
          message: `User created with id ${newUser.id}.`,
          data: newUser 
        });
      });
    },
  
    // Haal alle gebruikers op met een filter op basis van parameters
    
    getAll: (filters, callback) => {
        let sql = "SELECT * FROM user";
        const values = [];
        const conditions = [];
        const validFields = ["id", "firstName", "lastName", "emailAddress", "isActive"];

        for (const [field, value] of Object.entries(filters)) {
            if (!validFields.includes(field)) {
                // Immediately return an error if an invalid field is found
                return callback({ status: 400, message: `Invalid field provided: ${field}` }, null);
            }

            let fieldValue = value;
            if (field === "isActive") {
                fieldValue = value === "true" || value === true ? 1 : 0;
            }

            conditions.push(`${field} = ?`);
            values.push(fieldValue);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        pool.query(sql, values, (err, results) => {
            if (err) {
                return callback({ status: 500, message: 'Internal Server Error' }, null);
            }
            return callback(null, results);
        });
    },

    
    
    
    
  
    // Haal een gebruiker op basis van id
    getById: (id, callback) => {
      const query = 'SELECT * FROM `user` WHERE id = ?';
  
      pool.query(query, [id], (err, results) => {
        if (err) {
          return callback({
            status: 500,
            message: 'Server error'
          }, null);
        }
  
        if (results.length === 0) {
          return callback({
            status: 404,
            message: `User not found`
          }, null);
        }
  
        callback(null, {
          message: `User retrieved successfully`,
          data: results[0]
        });
      });
    },
  
    // Update een gebruiker op basis van id
    update: (id, updatedUser, callback) => {
      const query = `
        UPDATE \`user\` SET firstName = ?, lastName = ?, isActive = ?, emailAddress = ?, password = ?, phoneNumber = ?, roles = ?, street = ?, city = ?
        WHERE id = ?
      `;
      const values = [
        updatedUser.firstName,
        updatedUser.lastName,
        updatedUser.isActive,
        updatedUser.emailAddress,
        updatedUser.password,
        updatedUser.phoneNumber,
        updatedUser.roles,
        updatedUser.street,
        updatedUser.city,
        id
      ];
  
      pool.query(query, values, (err, results) => {
        if (err) {
          return callback({
            status: 500,
            message: 'Server error'
          }, null);
        }
  
        if (results.affectedRows === 0) {
          return callback({
            status: 404,
            message: `User not found.`
          }, null);
        }
  
        callback(null, {
          message: `User not found.`,
          data: updatedUser
        });
      });
    },

  getProfile: (userId, callback) => {
    const query = 'SELECT id FROM `user` WHERE id = ?'; // Modified to fetch only the 'id' column

    pool.query(query, [userId], (err, results) => {
        if (err) {
            logger.error('Error fetching user profile:', err);
            return callback({
                status: 500,
                message: 'Server error: ' + err.message // Include the SQL error message for better debugging
            }, null);
        }

        if (results.length === 0) {
            logger.info(`User not found with id ${userId}`); // Corrected variable reference
            return callback({
                status: 404,
                message: `User not found with id ${userId}.` // Corrected variable reference
            }, null);
        }

        const userProfile = results[0]; // This will now contain only the 'id' property
        logger.trace(`Profile retrieved for user id ${userId}`); // Corrected variable reference
        callback(null, {
            message: `Profile retrieved successfully.`,
            data: userProfile // This now sends back only the ID to the client
        });
    });
},

  
    // Verwijder een gebruiker op basis van id
    delete: (id, callback) => {
      const query = 'DELETE FROM `user` WHERE id = ?';
  
      pool.query(query, [id], (err, results) => {
        if (err) {
          return callback({
            status: 500,
            message: 'Server error'
          }, null);
        }
  
        if (results.affectedRows === 0) {
          return callback({
            status: 404,
            message: `User not found with id ${id}.`
          }, null);
        }
  
        callback(null, {
          message: `User deleted with id ${id}.`
        });
      });
    }
  };

module.exports = userService
