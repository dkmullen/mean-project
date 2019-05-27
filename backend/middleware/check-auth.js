const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'secret_this_should_be_longer');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Auth failed!' });
  }
};

// try/catch block is one way to acknowledge that the code in the try part might fail
// ie if there is no auth header
