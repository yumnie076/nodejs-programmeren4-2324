//
// Application configuration
//
const secretkey = process.env.JWT_SECRET || "DitIsEenGeheim";
 
const config = {
  secretkey,
};
 
module.exports = config;
