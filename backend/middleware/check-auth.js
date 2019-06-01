const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    // Here we add some data of our own to the req body
    req.userData = {email: decodedToken.email, userId: decodedToken.userId};
    next();
  } catch (error) {
    res.status(401).json({ message: 'You are not authenticated.' });
  }
};

// try/catch block is one way to acknowledge that the code in the try part might fail
// ie if there is no auth header
