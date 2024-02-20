const jwt = require('jsonwebtoken');
require("dotenv").config()



const authenticateUser = (req, res, next) => {
    // Extract token from request headers
    const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent in the 'Authorization' header
  
    // Verify token
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    jwt.verify(token, process.env.SECRET_TOKEN_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      // Check token expiration
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp <= currentTimestamp) {
        return res.status(401).json({ error: 'Token expired' });
      }
  
      // Attach decoded user information to request object
      req.user = decodedToken.user;
      next();
    });
  };

  module.exports = authenticateUser;