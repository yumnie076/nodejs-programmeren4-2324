const database = require('../dao/inmem-db');

const userService = {
    create: (user, callback) => {
        database.getConnection((err, connection) => {
            if (err) {
                const error = new Error('Database connection failed');
                error.status = 500;
                return callback(error, null);
            }

            connection.query(
                'SELECT * FROM user WHERE emailAdress = ?',  // Aangepast naar emailAdress
                [user.emailAdress],  // Aangepast naar emailAdress
                (err, results) => {
                    if (err) {
                        connection.release();
                        const error = new Error(err.message);
                        error.status = 500;
                        return callback(error, null);
                    }

                    if (results.length > 0) {
                        connection.release();
                        const error = new Error('User already exists');
                        error.status = 409;
                        return callback(error, null);
                    }

                    const insertQuery = `
                        INSERT INTO user 
                        (firstName, lastName, street, city, emailAdress, password, phoneNumber, isActive)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                    `;
                    const values = [
                        user.firstName,
                        user.lastName,
                        user.street,
                        user.city,
                        user.emailAdress,
                        user.password,
                        user.phoneNumber || null
                    ];

                    connection.query(insertQuery, values, (err, result) => {
                        connection.release();

                        if (err) {
                            const error = new Error(err.message);
                            error.status = 500;
                            return callback(error, null);
                        }

                        const createdUser = {
                            id: result.insertId,
                            ...user
                        };

                        return callback(null, {
                            status: 200,
                            message: `User created with id ${result.insertId}.`,
                            data: createdUser
                        });
                    });
                }
            );
        });
    },

    getAll: (filters, callback) => {
        // Voeg logging toe om filters te inspecteren
        console.log('Received filters:', filters);

        const allowedFilters = ['firstName', 'isActive', 'emailAdress'];
        const invalidFilters = Object.keys(filters).filter(key => !allowedFilters.includes(key));

        if (invalidFilters.length > 0) {
            console.log('Invalid filters detected:', invalidFilters);
            const error = new Error(`Invalid filter: ${invalidFilters[0]}`);
            error.status = 400;
            return callback(error, null);
        }

        database.getAll(filters, (err, data) => {
            if (err) {
                console.error('Database error:', err);
                const error = new Error(err.message);
                error.status = 500;
                return callback(error, null);
            }

            return callback(null, {
                status: 200,
                message: `Found ${data.length} users.`,
                data: data
            });
        });
    },

    getById: (id, callback) => {
        database.getUserById(id, (err, data) => {
            if (err) {
                console.error('Database error:', err);
                const error = new Error(err.message);
                error.status = 500;
                return callback(error, null);
            }

            if (!data || Object.keys(data).length === 0) {
                const error = new Error(`User not found with id ${id}.`);
                error.status = 404;
                return callback(error, null);
            }

            return callback(null, {
                status: 200,
                message: `User found with id ${id}.`,
                data: data
            });
        });
    },

    updateUser: (id, updatedUser, authUserId, callback) => {
        console.log('Update request for user:', id, 'Data:', updatedUser);

        if (parseInt(id) !== parseInt(authUserId)) {
            const error = new Error('Forbidden: You can only update your own data');
            error.status = 403;
            return callback(error, null);
        }

        // Valideer vereiste velden
        if (!updatedUser.emailAdress) {
            const error = new Error('Email address is required');
            error.status = 400;
            return callback(error, null);
        }

        database.updateUser(id, updatedUser, (err, data) => {
            if (err) {
                console.error('Update error:', err);
                const error = new Error(err.message);
                error.status = err.message.includes('not found') ? 404 : 400;
                return callback(error, null);
            }

            return callback(null, {
                status: 200,
                message: `User updated with id ${id}.`,
                data: data
            });
        });
    },

    delete: (id, authUserId, callback) => {
        if (parseInt(id) !== parseInt(authUserId)) {
            const error = new Error('Forbidden: You can only delete your own data');
            error.status = 403;
            return callback(error, null);
        }

        database.deleteUser(id, (err, data) => {
            if (err) {
                console.error('Delete error:', err);
                const error = new Error(`User not found with id ${id}.`); // Aangepast bericht
                error.status = err.message.includes('not found') ? 404 : 500;
                return callback(error, null);
            }

            return callback(null, {
                status: 200,
                message: `User deleted with id ${id}.`,
                data: data
            });
        });
    },

    getProfile: (userId, callback) => {
        database.getProfile(userId, (err, data) => {
            if (err) {
                const error = new Error(err.message);
                error.status = 500;
                return callback(error, null);
            }

            if (!data) {
                const error = new Error(`User not found with id ${userId}.`);
                error.status = 404;
                return callback(error, null);
            }

            return callback(null, {
                status: 200,
                message: `Profile found for user with id ${userId}.`,
                data: data
            });
        });
    }
};

module.exports = userService;