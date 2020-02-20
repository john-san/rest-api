'use strict';

// load express & routes
const express = require('express');
const userRoutes = require('./user');
const courseRoutes = require('./course');

// Construct a router instance.
const router = express.Router();

router.use('/users', userRoutes);
router.use('/courses', courseRoutes);

module.exports = router;