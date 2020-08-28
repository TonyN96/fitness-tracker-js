"use strict";

const logger = require("../utils/logger");
const accounts = require ('./accounts.js');
const member = require('../models/member');
const utility = require("../models/utility");
const assessmentStore = require("../models/assessment-store");
const goalsStore = require("../models/goals-store");
const uuid = require('uuid');
const expressHbs = require('express-handlebars');

const dashboard = {

  index(request, response) {
    const loggedInMember = accounts.getLoggedInMember(request);
    const loggedInTrainer = accounts.getLoggedInTrainer(request);
    if (loggedInMember != null) {
      const id = loggedInMember.id;
      const memberGoals = goalsStore.getUserGoals(loggedInMember.id);
      const memberAssessments = assessmentStore.getUserAssessments(loggedInMember.id);
      //Member assessments are sorted by chronological order using the sortDateFunction from the utility model
      memberAssessments.sort(utility.sortDateFunction);
      //The status of the goals are set using the setGoalStatus function from the utility model
      utility.setGoalsStatus(memberGoals, memberAssessments);
      //An array is initialised which stores the count for each type of goal sorted by their status
      // (i.e. Open, Missed, Achieved)
      const goalsCount = utility.goalsCount(memberGoals);
      let assessment = null;
      //If the memberAssessments array has at least one object, let assessment be assigned to the first object
      //i.e. the most recent one as the array is sorted by chronological order
      if (memberAssessments.length > 0) {
        assessment = memberAssessments[0];
      }
      //The data that is being passed to the Handlebars view
      const viewData = {
        goalsCount: goalsCount,
        userId: id,
        name: loggedInMember.name,
        bmi: utility.calculateBMI(loggedInMember, assessment),
        weightIndicator: utility.isIdealBodyWeight(loggedInMember, assessment),
        bmiCategory: utility.BMICategory(utility.calculateBMI(loggedInMember, assessment)),
        goals: memberGoals,
        assessments: memberAssessments,
      }
      logger.info('Rendering Member Dashboard');
      response.render('dashboard', viewData);
      //If the user logged in is not a member and is a trainer
    } else if ((loggedInMember == null) && (loggedInTrainer != null)) {
        assessmentStore.getUserAssessments()
        const viewData = {
          //Pass a list of all members to the Handlebars view
          members: member.getAllMembers()
        }
        logger.info('Rendering Trainer Dashboard');
        response.render('trainerDashboard', viewData);
    } else {
      response.redirect('/login');
    }
  },

  //Method for adding a goal for a member
  addGoal(request, response)
  {
    //Get the member the goal is being added for using the id passed in as a parameter
    const currentMember = member.getMemberById(request.params.id);
    //Create a new date object using the date passed in
    const goalDate = new Date(request.body.date);
    //https://stackoverflow.com/questions/6040515/how-do-i-get-month-and-date-of-javascript-in-2-digit-format
    //Format the date as a string
    let goalDateStr = ("0" + goalDate.getDate()).slice(-2) + "-"
      + (("0" + (goalDate.getMonth() + 1)).slice(-2)) + "-"
      + goalDate.getFullYear()
    const newGoal = {
      userid: currentMember.id,
      //Giving the goal a unique id
      id: uuid.v1(),
      date: goalDateStr,
      weight: parseInt(request.body.weight),
      chest: parseInt(request.body.chest),
      thigh: parseInt(request.body.thigh),
      upperArm: parseInt(request.body.upperArm),
      waist: parseInt(request.body.waist),
      hips: parseInt(request.body.hips),
    }
    logger.info("Adding Goal");
    goalsStore.addGoal(newGoal);
    //If the goal is being added by a trainer, redirect to the trainerView view
    if (accounts.getLoggedInTrainer(request)) {
      response.redirect('/trainerView/' + request.params.id);
    } else {
      //Otherwise redirect to the standard member dashboard view
      response.redirect('/dashboard');
    }
  },

  //Method for removing a member goal
  deleteGoal(request, response) {
    const goalId = request.params.id;
    const goal = goalsStore.getGoal(goalId);
    //Storing the userId from the goal so that it can be used to redirect if it is a trainer that is removing the goal
    const goalUserId = goal.userid;
    logger.info(`Deleting Goal ${goalId}`);
    goalsStore.removeGoal(goalId);
    //If it is a trainer removing the goal, redirect to trainer view
    if (accounts.getLoggedInTrainer(request)) {
      response.redirect('/trainerView/' + goalUserId);
    } else {
      //Otherwise redirect to Member view
      response.redirect('/dashboard');
    }
  },

  //Method for adding an assessment for a member
  addAssessment(request, response)
  {
    const currentMember = accounts.getLoggedInMember(request);
    const memberAssessments = assessmentStore.getUserAssessments(currentMember.id);
    memberAssessments.sort(utility.sortDateFunction);
    //Using the checkTrend method from the utility model to find what the trend should be for the new assessment
    const assessmentTrend = utility.checkTrend(parseInt(request.body.weight), memberAssessments);
    //Create a new date object using the current date
    const currentDate = new Date();
    //https://stackoverflow.com/questions/6040515/how-do-i-get-month-and-date-of-javascript-in-2-digit-format
    //Formatting the date to a specific date string format
    let currentDateStr = ("0" + currentDate.getDate()).slice(-2) + "-"
      + (("0" + (currentDate.getMonth() + 1)).slice(-2)) + "-"
      + currentDate.getFullYear() + " "
      + ("0" + currentDate.getHours()).slice(-2) + ":"
      + ("0" + currentDate.getMinutes()).slice(-2) + ":"
      + ("0" + currentDate.getSeconds()).slice(-2);
    //Creating new assessment object using the following details
    const newAssessment = {
      userid: currentMember.id,
      id: uuid.v1(),
      date: currentDateStr,
      weight: parseInt(request.body.weight),
      chest: parseInt(request.body.chest),
      thigh: parseInt(request.body.thigh),
      upperArm: parseInt(request.body.upperArm),
      waist: parseInt(request.body.waist),
      hips: parseInt(request.body.hips),
      trend: assessmentTrend,
    }
    logger.info("Adding Assessment");
    assessmentStore.addAssessment(newAssessment);
    response.redirect('/dashboard');
  },

  //Method for removing a Member's assessment
  deleteAssessment(request, response) {
    const assessmentId = request.params.id;
    logger.info(`Deleting Assessment ${assessmentId}`);
    assessmentStore.removeAssessment(assessmentId);
    response.redirect('/dashboard');
  },

  //Method used when a member is updating their details
  saveDetails(request, response) {
    let loggedInMember = accounts.getLoggedInMember(request);
    loggedInMember.name = request.body.name;
    loggedInMember.email = request.body.email;
    loggedInMember.password = request.body.password;
    loggedInMember.address = request.body.address;
    loggedInMember.gender = request.body.gender;
    loggedInMember.height = parseInt(request.body.height);
    loggedInMember.startingWeight = parseInt(request.body.startingWeight);
    logger.info('Updating details for ' + loggedInMember.name);
    response.redirect("/dashboard");
  },

};

module.exports = dashboard;