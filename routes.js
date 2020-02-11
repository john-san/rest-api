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

const doesUserExist = async (user) => {
  const result = await User.findOne({ 
    where: { 
      emailAddress: user.emailAddress 
    } 
  });

  return result ? true : false;
}

const doesCourseExist = async (course) => {
  const result = await Course.findOne({ 
    where: { 
      title: course.title 
    } 
  });

  return result ? true : false;
}

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress,
  });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "emailAddress"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
], async (req, res) => {
  const errors = validationResult(req);
  // Return validation errors if they exist
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const user = req.body;
  const exists = await doesUserExist(user);

  // if user exists, give error.  Otherwise, create user
  if (exists) {
    return res.status(422).json({ error: `A user with the email ${user.emailAddress} already exists.` });
  } else {
    user.password = bcryptjs.hashSync(user.password);
    await User.create(user);
    return res.status(201).location('/').end();
  }
});

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/courses', async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User
      }
    ]
  });

  return res.status(200).json(courses);
});

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', async (req, res) => {
  const course = await Course.findOne({ 
    where: { 
      id: req.params.id 
    },
    include: [
      {
        model: User
      }
    ]
  });

  res.status(200).json(course);
});

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses/', authenticateUser, [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
], async (req, res) => {
  const errors = validationResult(req);
  // Return validation errors if they exist
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const course = req.body;
  const exists = await doesCourseExist(course);

  // if user exists, give error.  Otherwise, create user
  if (exists) {
    return res.status(422).json({ error: `The course titled "${course.title}" already exists.` });
  } else {
    await Course.create(course);
    return res.status(201).location(`/courses/${course.id}`).end();
  }
});

// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', authenticateUser, [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
], async (req, res) => {

  const errors = validationResult(req);
  // Return validation errors if they exist
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const course = await Course.findOne({ 
    where: { 
      id: req.params.id 
    }
  });

  if (course) {
    await course.update({
      title: req.body.title,
      description: req.body.description
    }, { fields: ['title', 'description'] });
  
    res.status(204).end();
  } else {
    res.status(404).json({ error: "Course doesn't exist"});
  }
});

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, async (req, res) => {
  const course = await Course.findOne({ 
    where: { 
      id: req.params.id 
    }
  });

  if (course) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.status(404).json({ error: "Course doesn't exist"});
  }
});

module.exports = router;