'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { sequelize, Course, User } = require('./models');



// Construct a router instance.
const router = express.Router();

const authenticateUser = async (req, res, next) => {
  let message = null;

  // Get the user's credentials from the Authorization header.
  const credentials = auth(req);

  if (credentials) {
    // Look for a user whose `emailAddress` matches the credentials `name` property. might need await
    const user = await User.findOne({ where: { emailAddress: credentials.name } });

    
    // users.find(u => u.username === credentials.name);

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

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress,
  });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', (req, res) => {

});

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/courses', (req, res) => {

});

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', (req, res) => {

});

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses/:id', (req, res) => {

});

// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', (req, res) => {

});

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', (req, res) => {

});

module.exports = router;