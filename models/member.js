'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

const member = {

  store: new JsonStore('./models/member-store.json', { members: [] }),
  collection: 'members',

  getAllMembers() {
    return this.store.findAll(this.collection);
  },

  addMember(member) {
    this.store.add(this.collection, member);
    this.store.save();
  },

  getMemberById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  findByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },
  
  deleteMember(id) {
    const member = this.getMemberById(id);
    const members = this.members;
    _.remove(members, member);
  },
  
};

module.exports = member;