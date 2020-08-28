'use strict';

const member = require('../models/member');
const trainer = require('../models/trainer');
const logger = require('../utils/logger');
const uuid = require('uuid');

const accounts = {

  //login method which renders the login.hbs view
  login(request, response) {
    const viewData = {
      title: 'Login',
    };
    response.render('login', viewData);
  },

  //signup method which renders the signup.hbs view
  signup(request, response) {
    const viewData = {
      title: 'Sign Up',
    };
    response.render('signup', viewData);
  },

  //updateDetails method which renders the updateDetails.hbs view
  updateDetails(request, response) {
    const viewData = {
      title: 'updateDetails',
    }
    response.render('updateDetails', viewData);
  },

  //register method which creates a new member object from the details entered
  //and adds this new member object to the list of existing members
  register(request, response) {
      const newMember = request.body;
      //Setting a unique ID for the new member
      newMember.id = uuid.v1();
      //Setting the new member's assessments array to empty
      newMember.assessments = [];
      member.addMember(newMember);
      logger.info(`registering ${newMember.email}`);
      response.redirect('/');
  },

  //authenticate method which is used to validate a user's login credentials
  authenticate(request, response) {
    const emailEntered = request.body.email;
    let user = member.findByEmail(emailEntered);
    //If user is not null, then a member has been found by this email address
    if (user != null) {
      //Checking if the user's password matches the password entered
      if (request.body.password == user.password) {
        response.cookie('loggedInMember', user.email);
        logger.info(`Logging in ${user.email}`);
        response.redirect('/dashboard');
      } else {
        logger.info(`Incorrect Password Entered`);
        response.redirect('/login');
      }
    } else if (user == null) {
      //If there is no member found, a trainer is searched for with the same email entered
      user = trainer.findByEmail(emailEntered);
      if (user != null) {
        //Checking if the user's password matches the password entered
        if (request.body.password == user.password) {
          response.cookie('loggedInTrainer', user.email);
          logger.info(`Logging in ${user.email}`);
          response.redirect('/dashboard');
        } else {
          logger.info(`Incorrect Password Entered`);
          response.redirect('/login');
        }
      }
    } else {
      logger.info(`Invalid Email Entered`);
      response.redirect('/login');
    }
  },

  //logout method which clears the cookies
  logout(request, response) {
    response.cookie('loggedInMember', '');
    response.cookie('loggedInTrainer', '');
    response.redirect('/');
  },

  //Method used to get the email address of the currently logged in member
  getLoggedInMember(request) {
    const memberEmail = request.cookies.loggedInMember;
    return member.findByEmail(memberEmail);
  },

  //Method used to get the email address of the currently logged in trainer
  getLoggedInTrainer(request) {
    const trainerEmail = request.cookies.loggedInTrainer;
    return trainer.findByEmail(trainerEmail);
  },

  //Method used to remove a member from the list of users
  deleteMember(request, response) {
    const memberId = request.params.id;
    logger.info(`Deleting User ${memberId}`);
    member.deleteMember(memberId);
    response.redirect('/trainerDashboard');
  },
  
};

module.exports = accounts;