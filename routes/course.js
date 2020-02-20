'use strict';

// load modules, models, helpers
const express = require('express');
const { Course, User } = require('../models');
const { asyncHandler, authenticateUser, courseValidationRules, validate } = require('../helpers');

// Construct a router instance.
const router = express.Router();

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: [
      {
        model: User,
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt']
        }
      }
    ]
  });

  return res.json(courses);
}));

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findOne({ 
    where: { 
      id: req.params.id 
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: [
      {
        model: User,
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt']
        }
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
router.post('/', authenticateUser, courseValidationRules(), validate, asyncHandler(async (req, res) => {
  const newCourse = await Course.create(req.body);
  return res.status(201).location(`/courses/${newCourse.id}`).end();
}));

// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/:id', authenticateUser, courseValidationRules(), validate, asyncHandler(async (req, res) => {
  const course = await Course.findOne({ 
    where: { 
      id: req.params.id 
    }
  });
  
  if (course) {
    const idMatch = req.currentUser.id == course.userId;
    if (idMatch) {
      await course.update({
        title: req.body.title,
        description: req.body.description
      }, { fields: ['title', 'description'] });
      res.status(204).end();
    } else {
      res.status(403).json({ error: "You do not have permission to update this course." });
    }
  } else {
    res.status(404).json({ error: "Course doesn't exist"});
  }
}));

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findOne({ 
    where: { 
      id: req.params.id 
    }
  });

  if (course) {
    const idMatch = req.currentUser.id == course.userId;
    if (idMatch) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ error: "You do not have permission to delete this course." });
    }
  } else {
    res.status(404).json({ error: "Course doesn't exist"});
  }
}));

module.exports = router;