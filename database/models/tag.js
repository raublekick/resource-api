"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    "Tag",
    {
      name: DataTypes.STRING,
    },
    {}
  );
  Tag.associate = function (models) {
    // associations can be defined here
    Tag.belongsToMany(models.Resource, {
      as: "Resources",
      through: "ResourceTags",
    });
  };
  return Tag;
};
