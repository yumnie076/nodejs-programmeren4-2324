require('dotenv').config()

const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const {
    routes : authenticationRoutes,
    validateToken,
} = require('./src/routes/authentication.routes')
const logger = require('./src/util/logger')
const mealRoutes = require('./src/routes/meal.routes.js')



const app = express()

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())

app.use("/api",authenticationRoutes)
app.use(userRoutes)
app.use(mealRoutes)

const port = process.env.PORT || 3000

// Dit is een voorbeeld van een simpele route
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        studentName: 'Yumnie Taouil',
        studentNumber: '2211614',
        description: 'this is the api for the share-a-meal app'
    }
    res.json(info)
})





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
