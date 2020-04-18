"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return null;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
