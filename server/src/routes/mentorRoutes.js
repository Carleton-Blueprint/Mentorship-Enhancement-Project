const express = require('express');
const { createMentor } = require('../controllers/mentor_controller');

const mentorRouter = express.Router();

// post-route needed for creation 
mentorRouter.post('/create', createMentor);

module.exports = { mentorRouter };

