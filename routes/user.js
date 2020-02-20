'use strict';

// load modules, models, helpers
const express = require('express');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { asyncHandler, authenticateUser, userValidationRules, userUpdateValidationRules, validate } = require('../helpers');

// Construct a router instance.
const router = express.Router();

// GET /api/users 200 - Returns the currently authenticated user
router.get('/', authenticateUser, (req, res) => {
  const { id, firstName, lastName, emailAddress } = req.currentUser;
  res.json({ id, firstName, lastName, emailAddress });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/', userValidationRules(), validate, asyncHandler(async (req, res) => {
  const user = req.body;
  user.password = bcryptjs.hashSync(user.password);
  await User.create(user);
  return res.status(201).location('/').end();
}));

// PUT /api/users/:id 204 - Updates a user and returns no content
router.put('/:id', authenticateUser, userUpdateValidationRules(), validate, asyncHandler(async (req, res) => {
  const user = await User.findOne({ 
    where: { 
      id: req.params.id 
    }
  });
  
  if (user) {
    const idMatch = req.currentUser.id == user.id;
    if (idMatch) {
      await user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName
      }, { fields: ['firstName', 'lastName'] });

      if (req.body.emailAddress) {
        user.update({ emailAddress: req.body.emailAddress },
          { fields: ['emailAddress'] } );
      }
      
      if (req.body.password) {
        user.update({ password: bcryptjs.hashSync(req.body.password) },
        { fields: ['password'] } );
      }

      res.status(204).end();
    } else {
      res.status(403).json({ error: "You do not have permission to update these settings." });
    }
  } else {
    res.status(404).json({ error: "User doesn't exist" });
  }
}));

// DELETE /api/users/:id 204 - Deletes a user and returns no content
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
  const user = await User.findOne({ 
    where: { 
      id: req.params.id 
    }
  });

  if (user) {
    const idMatch = req.currentUser.id == user.id;
    if (idMatch) {
      await user.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ error: "You do not have permission to delete this user." });
    }
  } else {
    res.status(404).json({ error: "User doesn't exist"});
  }
}));

module.exports = router;