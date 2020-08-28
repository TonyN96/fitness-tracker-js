'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

const goalsStore = {

  store: new JsonStore('./models/goals-store.json', { goalsCollection: [] }),
  collection: 'goalsCollection',

  getGoal(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  getUserGoals(userid) {
    return this.store.findBy(this.collection, { userid: userid });
  },

  addGoal(assessment) {
    this.store.add(this.collection, assessment);
    this.store.save();
  },

  removeGoal(id) {
    const assessment = this.getGoal(id);
    this.store.remove(this.collection, assessment);
    this.store.save();
  },

}

module.exports = goalsStore;