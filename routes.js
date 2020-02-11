'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const { sequelize, Course, User } = require('./models');
const { asyncHandler, authenticateUser, doesUserExist, doesCourseExist } = require('./helpers/index');
const { userValidationRules, courseValidationRules, validate } = require('./helpers/validator');

// Construct a router instance.
const router = express.Router();

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress,
  });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', userValidationRules(), validate, asyncHandler(async (req, res) => {
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
}));

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User
      }
    ]
  });

  return res.status(200).json(courses);
}));

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async (req, res) => {
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

  if (course) {
    res.status(200).json(course);
  } else {
    res.status(404).json({ Error: "Course doesn't exist" });
  }
  
}));

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses/', authenticateUser, courseValidationRules(), validate, asyncHandler(async (req, res) => {
  const course = req.body;
  const exists = await doesCourseExist(course);

  // if user exists, give error.  Otherwise, create user
  if (exists) {
    return res.status(422).json({ error: `The course titled "${course.title}" already exists.` });
  } else {
    await Course.create(course);
    return res.status(201).location(`/courses/${course.id}`).end();
  }
}));

// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', authenticateUser, courseValidationRules(), validate, asyncHandler(async (req, res) => {
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
}));

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
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
}));

module.exports = router;