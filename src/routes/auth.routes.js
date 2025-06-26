const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const authController = require('../controllers/auth.controller')
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../util/config").secretkey;
const logger = require("../util/logger");

 
function validateLogin(req, res, next) {
  try {
    if (!req.body.emailAdress || !req.body.password) {
      throw new Error("email and password are required.");
    }
    assert(typeof req.body.emailAdress === "string", "email must be a string.");
    assert(typeof req.body.password === "string", "password must be a string.");
    next();
  } catch (ex) {
    next({
      status: 400,
      message: ex.toString(),
      data: {},
    });
  }
}
 
function validateToken(req, res, next) {
  logger.info("validateToken called");
  logger.trace("Headers:", req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      logger.warn("No token provided!");
      next({
          status: 401,
          message: "No token provided!",
          data: {},
      });
  } else {
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
          if (err) {
              logger.debug("token:" + token);
              logger.debug("jwtSecretKey:" + jwtSecretKey);
              logger.warn("Token invalid!" + err.message);
              next({
                  status: 401,
                  message: "Token invalid!", //
                  data: {},
              });
          }
          if (payload) {
              logger.debug("token is valid", payload);
              req.userId = payload.id;
              logger.debug("userId set in request:", req.userId);  
              next();
          }
      });
  }
}



 
router.post('/api/login', validateLogin, authController.login)
 
module.exports = { router, validateToken };
 

