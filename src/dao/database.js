const { secretkey } = require('../util/config');
const pool = require('./dbconnection')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require("../util/config").secretkey;
 
const mysqlDb = {
  // Add a new user
  addUser(user, callback) {
    const sql = `
        INSERT INTO user
        (firstName, lastName, emailAdress, password, phoneNumber, roles, street, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      user.firstName,
      user.lastName,
      user.emailAdress,
      user.password,
      user.phoneNumber,
      user.roles,
      user.street,
      user.city,
      user.isActive,
    ];
    pool.query(sql, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        user.id = result.insertId;
        callback(null, user);
      }
    });
  },
 
  // Retrieve all users
  getAll: (filters, callback) => {
    let sql = "SELECT * FROM user";
    const values = [];
    const conditions = [];

    if (filters && Object.keys(filters).length) {
        for (const key of Object.keys(filters)) {
            // Add a check to ensure the field is valid
           if (['firstName', 'lastName', 'emailAdress', 'isActive', 'id', 'city', 'street', 'roles', 'phoneNumber'].includes(key)) {

                conditions.push(`${key} = ?`);
                values.push(filters[key]);
            } else {
                // Return error if the field is not valid
                callback(new Error(`Invalid field: ${key}`), null);
                return; // Ensure we return after calling the callback with an error
            }
        }

        if (conditions.length) {
            sql += " WHERE " + conditions.join(" AND ");
        }
    }

    pool.query(sql, values, (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
},


// Get a single user by ID
getUserById(id, callback) {
  pool.query("SELECT * FROM user WHERE id = ?", [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    callback(null, results[0]);
  });
},

 
  // Update a user's information
  updateUser(id, newData, callback) {
    // Eerst de huidige waarden van de gebruiker ophalen
    const getUserSql = 'SELECT * FROM user WHERE id = ?';
    pool.query(getUserSql, [id], (err, results) => {
        if (err) {
            console.error('SQL error:', err);
            return callback(err, null);
        }
        if (results.length === 0) {
            return callback({ message: `User with ID ${id} not found`, status: 404 }, null);
        }

        // Bestaande gegevens van de gebruiker
        const existingUser = results[0];

        // Gegevens bijwerken met nieuwe waarden
        const updatedUser = {
            firstName: newData.firstName || existingUser.firstName,
            lastName: newData.lastName || existingUser.lastName,
            emailAdress: newData.emailAdress || existingUser.emailAdress,
            password: newData.password || existingUser.password,
            phoneNumber: newData.phoneNumber || existingUser.phoneNumber,
            street: newData.street || existingUser.street,
            city: newData.city || existingUser.city,
            isActive: newData.isActive !== undefined ? newData.isActive : existingUser.isActive,
        };
        delete updatedUser.roles; 
        const sql = `
            UPDATE user
            SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ?, isActive = ?
            WHERE id = ?
        `;
        const values = [
            updatedUser.firstName,
            updatedUser.lastName,
            updatedUser.emailAdress,
            updatedUser.password,
            updatedUser.phoneNumber,
            updatedUser.street,
            updatedUser.city,
            updatedUser.isActive,
            id,
        ];

        pool.query(sql, values, (err, result) => {
            if (err) {
                console.error('SQL error:', err);
                callback(err, null);
            } else {
                if (result.affectedRows) {
                    callback(null, { id, ...updatedUser });
                } else {
                    callback({ message: `User with ID ${id} not found`, status: 404 }, null);
                }
            }
        });
    });
},



 
  // Delete a user
  deleteUser(id, callback) {
    pool.query("DELETE FROM user WHERE id = ?", [id], (err, result) => {
        if (err) {
            // Check for foreign key constraint error
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return callback({
                    status: 409, // Conflict
                    message: `Cannot delete user with ID ${id} because of a foreign key conflict.`,
                }, null);
            }
        } else {
            if (result.affectedRows) {
                callback(null, {
                    message: `User with ID ${id} successfully deleted`,
                });
            } else {
                callback({ status: 400, message: `User with ID ${id} not found` }, null);
            }
        }
    });
}
,
 
  // Authenticate a user
  authenticateUser(email, password, callback) {
    pool.query(
      "SELECT * FROM user WHERE emailAdress = ? AND password = ?",
      [email, password],
      (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          if (results.length > 0) {
            callback(null, results[0]);
          } else {
            callback({ message: "Authentication failed" }, null);
          }
        }
      }
    );
  },
 
  // Get a user with emailadress
  getUserByEmail: (email, callback) => {
    const sql = "SELECT * FROM user WHERE emailAdress = ?";
    pool.query(sql, [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      // Check if any user was found
      if (results.length === 0) {
        // No user found, return null without an error
        return callback(null, null);
      }
      // Return the first user found
      callback(null, results[0]);
    });
  },

   // login function
login(email, password, callback) {
    console.log(email);
    pool.query(
        'SELECT * FROM user WHERE emailAdress = ?',
        [email],
        (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                if (results.length > 0) {
                    const user = results[0];
                    if (user.password === password) {
                        const token = jwt.sign({ id: user.id }, jwtSecretKey, { expiresIn: '12d' });
                        callback(null, {
                            id: user.id,
                            emailAdress: user.emailAdress,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            token
                        });
                    } else {
                        callback({ status: 400, message: 'Passwords do not match' }, null);
                    }
                } else {
                    callback({ status: 404, message: 'User not found' }, null);
                }
            }
        }
    );
},

getUserByEmail: (email, callback) => {
    const sql = 'SELECT * FROM user WHERE emailAdress = ?'
    pool.query(sql, [email], (err, results) => {
        if (err) {
            return callback(err, null)
        }
        // Check if any user was found
        if (results.length === 0) {
            // No user found, return null without an error
            return callback(null, null)
        }
        // Return the first user found
        callback(null, results[0])
    })
},



getProfile(id, callback) {
    pool.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
        if (err) {
            callback(err, null)
        } else {
            if (results.length > 0) {
                callback(null, results[0])
            } else {
                console.log('id', id)
                callback({ message: 'User not found' }, null)
            }
        }
    })
},
 
  getConnection: (callback) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection from pool", err);
        return callback(err, null);
      }
      callback(null, connection);
    });
  },
 
  // Meal functions -------------------------------------------------------------------------------
  createMeal(meal, callback) {
    // Controleer of de verplichte velden aanwezig zijn
    const requiredFields = ['name', 'description', 'price', 'dateTime', 'maxAmountOfParticipants', 'imageUrl'];
    for (let field of requiredFields) {
      if (!meal[field]) {
        return callback(new Error(`Missing required field: ${field}`), null);
      }
    }
  
    const sql = `
      INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, allergenes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      meal.name,
      meal.description,
      meal.isActive || false, // Zet isActive standaard op false als deze niet is opgegeven
      meal.isVega || false, // Zet isVega standaard op false als deze niet is opgegeven
      meal.isVegan || false, // Zet isVegan standaard op false als deze niet is opgegeven
      meal.isToTakeHome || false, // Zet isToTakeHome standaard op false als deze niet is opgegeven
      meal.dateTime,
      meal.maxAmountOfParticipants,
      meal.price,
      meal.imageUrl,
      meal.cookId || null, // Zet cookId standaard op null als deze niet is opgegeven
      meal.allergenes || '', // Zet allergenes standaard op een lege string als deze niet is opgegeven
    ];
    
    pool.query(sql, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: result.insertId, ...meal });
      }
    });
  },
  
 
  getAllMeals(callback) {
    const sql = "SELECT * FROM meal";
    pool.query(sql, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },
 
  getMealById(mealId, callback) {
    const sql = "SELECT * FROM meal WHERE id = ?";
    pool.query(sql, [mealId], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results[0]);
      }
    });
  },
 
  deleteMeal(mealId, callback) {
    const sql = "DELETE FROM meal WHERE id = ?";
    pool.query(sql, [mealId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        if (result.affectedRows) {
          callback(null, {
            message: `Meal with ID ${mealId} deleted successfully`,
          });
        } else {
          callback(
            { status: 404, message: `Meal with ID ${mealId} not found` },
            null
          );
        }
      }
    });
  },

  getCookIdByMealId(mealId, callback) {
    const sql = "SELECT cookId FROM meal WHERE id = ?";
    pool.query(sql, [mealId], (err, results) => {
        if (err) {
            callback(err, null);
        } else if (results.length === 0) {
            callback({ status: 404, message: `Meal with ID ${mealId} not found` }, null);
        } else {
            callback(null, results[0].cookId);
        }
    });
},

updateMeal(id, newData, callback) {
  // Eerst de huidige waarden van de maaltijd ophalen
  const getMealSql = 'SELECT * FROM meal WHERE id = ?';
  pool.query(getMealSql, [id], (err, results) => {
      if (err) {
          console.error('SQL error:', err);
          return callback(err, null);
      }
      if (results.length === 0) {
          return callback({ message: `Meal with ID ${id} not found`, status: 404 }, null);
      }

      // Bestaande gegevens van de maaltijd
      const existingMeal = results[0];

      // Gegevens bijwerken met nieuwe waarden, indien aanwezig
      const updatedMeal = {
          isActive: newData.isActive !== undefined ? newData.isActive : existingMeal.isActive,
          isVega: newData.isVega !== undefined ? newData.isVega : existingMeal.isVega,
          isVegan: newData.isVegan !== undefined ? newData.isVegan : existingMeal.isVegan,
          isToTakeHome: newData.isToTakeHome !== undefined ? newData.isToTakeHome : existingMeal.isToTakeHome,
          dateTime: newData.dateTime || existingMeal.dateTime,
          maxAmountOfParticipants: newData.maxAmountOfParticipants || existingMeal.maxAmountOfParticipants,
          price: newData.price || existingMeal.price,
          imageUrl: newData.imageUrl || existingMeal.imageUrl,
          createDate: newData.createDate || existingMeal.createDate,
          updateDate: newData.updateDate || existingMeal.updateDate,
          name: newData.name || existingMeal.name,
          description: newData.description || existingMeal.description,
          allergenes: newData.allergenes || existingMeal.allergenes
      };

      const sql = `
          UPDATE meal
          SET 
              isActive = ?, 
              isVega = ?, 
              isVegan = ?, 
              isToTakeHome = ?, 
              dateTime = ?, 
              maxAmountOfParticipants = ?, 
              price = ?, 
              imageUrl = ?, 
              createDate = ?, 
              updateDate = ?, 
              name = ?, 
              description = ?, 
              allergenes = ?
          WHERE id = ?
      `;
      const values = [
          updatedMeal.isActive,
          updatedMeal.isVega,
          updatedMeal.isVegan,
          updatedMeal.isToTakeHome,
          updatedMeal.dateTime,
          updatedMeal.maxAmountOfParticipants,
          updatedMeal.price,
          updatedMeal.imageUrl,
          updatedMeal.createDate,
          updatedMeal.updateDate,
          updatedMeal.name,
          updatedMeal.description,
          updatedMeal.allergenes,
          id,
      ];

      pool.query(sql, values, (err, result) => {
          if (err) {
              console.error('SQL error:', err);
              callback(err, null);
          } else {
              if (result.affectedRows) {
                  callback(null, { id, ...updatedMeal });
              } else {
                  callback({ message: `Meal with ID ${id} not found`, status: 404 }, null);
              }
          }
      });
  });
},

}

module.exports = mysqlDb;