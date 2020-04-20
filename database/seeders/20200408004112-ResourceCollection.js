"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "ResourceCollection",
      [
        {
          parentId: 1,
          childId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          parentId: 1,
          childId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("ResourceCollection", null, {});
  },
};
