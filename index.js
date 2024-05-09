require('dotenv').config()

const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const logger = require('./src/util/logger')
const pool = require('./mysql-pool')


const app = express()

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())

const port = process.env.PORT || 3000

// Dit is een voorbeeld van een simpele route
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        name: 'My Nodejs Express server',
        version: '0.0.1',
        description: 'This is a simple Nodejs Express server'
    }
    res.json(info)
})

app.get('/api/user', (req, res) => {
    pool.query('SELECT * FROM `user`', (err, results) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: 'Database error',
          data: {}
        });
      }
      res.status(200).json({
        status: 200,
        message: `Found ${results.length} users.`,
        data: results
      });
    });
  });

// Hier komen alle routes
app.use(userRoutes)

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
