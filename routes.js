'use strict';

const express = require('express');
const router = express.Router();

const dashboard = require('./controllers/dashboard.js');
const about = require('./controllers/about.js');
const trainerView = require('./controllers/trainerView.js');
const accounts = require('./controllers/accounts.js');

router.get('/', accounts.login);
router.get('/login', accounts.login);
router.get('/signup', accounts.signup);
router.get('/logout', accounts.logout);
router.post('/register', accounts.register);
router.post('/authenticate', accounts.authenticate);
router.get('/deleteMember/:id', accounts.deleteMember);
router.get('/updateDetails', accounts.updateDetails);

router.get('/dashboard', dashboard.index);
router.get('/trainerDashboard', dashboard.index);
router.post('/dashboard/addGoal/:id', dashboard.addGoal);
router.get('/deleteGoal/:id', dashboard.deleteGoal);
router.post('/dashboard/addAssessment', dashboard.addAssessment);
router.get('/dashboard/deleteAssessment/:id', dashboard.deleteAssessment);
router.post('/dashboard/saveDetails', dashboard.saveDetails);

router.get('/trainerView/:id', trainerView.index);
router.post('/trainerView/:userid/addComment/:id', trainerView.addComment);

router.get('/about', about.index);

module.exports = router;