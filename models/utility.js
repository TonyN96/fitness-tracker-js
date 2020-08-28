"use strict";

const logger = require("../utils/logger");

const utility = {

  //Method used for calculating a Member's BMI
  calculateBMI(member, assessment) {
    //If the assessment passed in was null, it means the member has no assessment's recorded yet
    //so the weight can be based off the member's starting weight
    let weight = null;
    if (assessment == null) {
      weight = member.startingWeight;
    } else {
      weight = assessment.weight;
    }
    //Algorithm used to calculate a member's BMI
    const bmi = weight / (member.height * member.height);
    //Rounding the BMI to two decimal places
    const bmiRounded = Math.round(bmi * 100.0) / 100.0;
    return bmiRounded;
  },

  //Method used to determine the BMI category of a member
  BMICategory(bmiValue) {
    let str = "";
    if (bmiValue < 16.0) {
            str = "SEVERELY UNDERWEIGHT";
        } else if ((bmiValue >= 16.0) && (bmiValue < 18.5)) {
            str = "UNDERWEIGHT";
        } else if ((bmiValue >= 18.5) && (bmiValue < 25.0)) {
            str = "NORMAL";
        } else if ((bmiValue >= 25.0) && (bmiValue < 30.0)) {
            str = "OVERWEIGHT";
        } else if ((bmiValue >= 30.0) && (bmiValue < 35.0)) {
            str = "MODERATELY OBESE";
        } else if (bmiValue >= 35.0) {
            str = "SEVERELY OBESE";
        }
        return str; 
  },

  //Method used to determine if a member's weight is ideal or not
  isIdealBodyWeight(member, assessment) {
    let idealWeight = 0;
        //Ideal weight varies depending on gender
        if (member.gender == "M") {
            idealWeight = 50;
        } else {
            idealWeight = 45.5;
        }
        //Converting the member's height from metres to inches and checking if it's higher than 60
        if (this.metersToInches(member.height) > 60) {
            idealWeight += ((this.metersToInches(member.height) - 60) * 2.3);
        }
        let weight = 0;
        if (assessment == null) {
            weight = member.startingWeight;
        } else {
            weight = assessment.weight;
        }
        const difference = weight - idealWeight;
        if (difference >= -0.2 && difference <= 0.2) {
            return true;
        } else {
            return false;
        }
  },

  //Method to convert meters to inches
  metersToInches(meters) {
        let x = meters*39.370;
        x = Math.round(x * 100.0)/100.0;
        return x;
    },

  //Method to check if the user's weight is higher or lower than most recent assessment weight
   checkTrend(weight, assessments) {
        if (assessments != null && assessments.length > 1) {
          let latestWeight = assessments[0].weight;
          if (latestWeight > weight) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
   },
  
  //https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
  //Method used to compare dates and ultimately sort them in chronological order
  sortDateFunction(a,b) {
        var dateA = new Date(a.date).getTime();
        var dateB = new Date(b.date).getTime();
        return dateA < dateB ? 1 : -1;  
      },

  //Method used to set the status of a member's goals
  setGoalsStatus(goals, assessments) {
    //Getting the current date
    const currentDate = new Date();
    //Looping through the goals array passed into the method
    for (let x = 0; x < goals.length; x++) {
      //https://stackoverflow.com/questions/7151543/convert-dd-mm-yyyy-string-to-date/7151626
      //Splitting the date where the '-' character appears i.e. between day, month and year
      let splitDate = goals[x].date.split('-');
      //Creating a new date object from the splitDate array
      let goalDate = new Date(parseInt(splitDate[2]), parseInt(splitDate[1]) - 1, parseInt(splitDate[0]));
      //If the goalDate is later than the current date, the goal is still open
      if (goalDate > currentDate) {
        goals[x].status = "Open";
      } else {
        //Initialising a priorAssessments array to be empty
        let priorAssessments = [];
        let y = 0;
        //While loop which continues as long as priorAssessments array is empty or
        //y is less than the length of the assessments array
        while ((priorAssessments === []) || (y < assessments.length)) {
          //Create new date object from date of assessment and compare it with goalDate
          let assessmentDate = new Date(assessments[y].date)
          //If goalDate is later, then add this assessment to the end of the priorAssessments array
          if (goalDate > assessmentDate) {
            priorAssessments.push(assessments[y]);
          }
          y++;
        }
        //If there is an assessment in the first index of the priorAssessments array, this will be the
        //one closest to the date of the goal
        if (priorAssessments[0] != null) {
          let assessment = priorAssessments[0];
          //Compare the measurements of the goal with the measurements of the assessment
          if ((assessment.weight <= goals[x].weight) &&
            (assessment.chest <= goals[x].chest) &&
            (assessment.thigh <= goals[x].thigh) &&
            (assessment.upperArm <= goals[x].upperArm) &&
            (assessment.waist <= goals[x].waist) &&
            (assessment.hips <= goals[x].hips)) {
            //If the goal measurements are higher than the measurements of the assessment, the goal has been achieved
            goals[x].status = "Achieved";
          } else {
            //Otherwise, the goal has been missed
            goals[x].status = "Missed";
          }
        }
      }
    }
  },

  //Method used to count the number of each type of goal status
  goalsCount(goals) {
    let goalsCount = {
      openGoals: 0,
      achievedGoals: 0,
      missedGoals: 0
    }
    //Looping through the goals array and checking the status of each one
    for (let x = 0; x < goals.length; x++) {
      if (goals[x].status == "Open") {
        goalsCount.openGoals++;
      } else if (goals[x].status == "Achieved") {
        goalsCount.achievedGoals++;
      } else if (goals[x].status == "Missed") {
        goalsCount.missedGoals++;
      }
    }
    //Returns an array of the values of each type of goal status
    return goalsCount;
  }
  
};

module.exports = utility;