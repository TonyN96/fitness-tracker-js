"use strict";

const logger = require("../utils/logger");
const member = require('../models/member');
const utility = require("../models/utility");
const assessmentStore = require("../models/assessment-store");
const goalsStore = require("../models/goals-store");

const trainerView = {

   index(request, response) {
     //Getting the specified member to be shown using the id parameter passed in
     const memberId = request.params.id;
     const selectedMember = member.getMemberById(memberId);
     //Getting the selected member's assessments
     const selectedMemberAssessments = assessmentStore.getUserAssessments(memberId);
     //Sorting the selected member's assessments
     selectedMemberAssessments.sort(utility.sortDateFunction);
     //Getting the selected member's goals
     const memberGoals = goalsStore.getUserGoals(memberId);
     //Setting the status of the selected member's goals
     utility.setGoalsStatus(memberGoals, selectedMemberAssessments);
     let latestAssessment = null;
     //If the selected member's array of assessments has at least one assessment, let the latest assessment be assigned
     //to latestAssessment
      if (selectedMemberAssessments.length > 0) {
        latestAssessment = selectedMemberAssessments[0];
      }
      //Data being passed to Handlebars to generate the page view
      const viewData = {
        userId: selectedMember.id,
        selectedMemberAssessments: selectedMemberAssessments,
        selectedMember: selectedMember,
        goals: memberGoals,
        bmi: utility.calculateBMI(selectedMember, latestAssessment),
        weightIndicator: utility.isIdealBodyWeight(selectedMember, latestAssessment),
        bmiCategory: utility.BMICategory(utility.calculateBMI(selectedMember, latestAssessment)),
      }
      response.render('trainerView', viewData);
   },

  //Method for allowing a trainer to add a comment to a Member's assessment
  addComment(request, response) {
     const memberId = request.params.userid;
     const assessmentId = request.params.id;
     const assessment = assessmentStore.getAssessment(assessmentId);
     assessment.comment = request.body.comment;
     logger.info('Updating comment for assessment ' + assessmentId);
     response.redirect('/trainerView/' + memberId);
  }

}

module.exports = trainerView;