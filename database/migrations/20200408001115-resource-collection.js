'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // Product belongsToMany Tag
    return queryInterface.createTable(
      'ResourceCollection',
      {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        ParentId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {
            model: 'Resources', // name of Source model
            key: 'id',
          },
          onDelete: 'CASCADE'
        },
        ChildId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {
            model: 'Resources', // name of Source model
            key: 'id',
          },
          onDelete: 'CASCADE'
        },
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    // remove table
    return queryInterface.dropTable('ResourceCollection');
  },
};
