const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { Course, User } = require('../models');

/* Handler function to wrap each route */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (err) {
      // Handle general error.  SequelizeValidation errors also passed through here
      next(err) 
    }
  }
}

const authenticateUser = async (req, res, next) => {
  let message = null;

  // Get the user's credentials from the Authorization header.
  const credentials = auth(req);

  if (credentials) {
    // Look for a user whose `emailAddress` matches the credentials `name` property. might need await
    const user = await User.findOne({ where: { emailAddress: credentials.name } });

    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);

        // Store the user on the Request object.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};


module.exports = {
  asyncHandler,
  authenticateUser
}