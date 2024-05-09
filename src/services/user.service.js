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
  
    // Haal alle gebruikers op
    getAll: (callback) => {
      logger.info('Get all users');
      const query = 'SELECT * FROM `user`';
  
      pool.query(query, (err, results) => {
        if (err) {
          logger.info('Error fetching users:', err.message || 'unknown error');
          return callback({
            status: 500,
            message: 'Server error'
          }, null);
        }
  
        callback(null, {
          message: `Found ${results.length} users.`,
          data: results
        });
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
            message: `User not found with id ${id}.`
          }, null);
        }
  
        callback(null, {
          message: `Found user with id ${id}.`,
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
            message: `User not found with id ${id}.`
          }, null);
        }
  
        callback(null, {
          message: `User updated with id ${id}.`,
          data: updatedUser
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
