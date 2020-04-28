"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: false,
      },
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      lang: DataTypes.STRING,
    },
    {}
  );
  User.associate = function (models) {
    // associations can be defined here
    User.belongsToMany(models.Resource, {
      as: "OwnedResources",
      through: "ResourceOwners",
    });
  };
  return User;
};
