const mysql = require("mysql2");
const logger = require("./src/util/logger");



// Set the log level to the value of the LOG_LEVEL environment variable
// Only here to show how to set the log level
const tracer = require("tracer");
tracer.setLevel(process.env.LOG_LEVEL);

// Hier worden de db connection settings opgehaald uit de .env file
const dbConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "share-a-meal",
};

logger.trace('Database Config:', dbConfig);

// Hier wordt de pool aangemaakt
const pool = mysql.createPool(dbConfig);

//
// Hier worden de events van de pool gelogd, zodat je kunt zien wat er gebeurt
//
pool.on("connection", (connection) => {
  logger.trace(
    `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
  );
});

pool.on("acquire", (connection) => {
  logger.trace("Connection %d acquired", connection.threadId);
});

pool.on("release", (connection) => {
  logger.trace("Connection %d released", connection.threadId);
});

// Functie om een query uit te voeren
function executeQuery(queryString, params, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error("Error getting connection from pool:", err);
      return callback(err, null);
    }

    connection.query(queryString, params, (error, results, fields) => {
      connection.release();

      if (error) {
        logger.error("Query error:", error);
        return callback(error, null);
      }

      callback(null, results);
    });
  });
}

// Gebruik de executeQuery-functie voor jouw specifieke query
const name = "Herman";
const isActive = 1;
const queryString = "SELECT * FROM `user` WHERE `firstName` = ? AND `id` > ?";

executeQuery(queryString, [name, isActive], (error, results) => {
  if (error) {
    logger.error("Error executing query:", error);
  } else {
    logger.debug("#results =", results.length);
    logger.debug({
      statusCode: 200,
      results: results,
    });
  }
});


// Export the pool, so that testcases can use it
module.exports = pool;
