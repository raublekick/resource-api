"use strict";
module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define(
    "Resource",
    {
      name: DataTypes.STRING,
      title: DataTypes.STRING,
      subTitle: DataTypes.STRING,
      coverPhoto: DataTypes.STRING,
      url: DataTypes.STRING,
      address: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {}
  );
  Resource.associate = function (models) {
    // associations can be defined here
    Resource.belongsTo(models.User, {
      as: "Owner",
      foreignKey: "OwnerUsername",
    });
    Resource.belongsToMany(Resource, {
      as: "Collection",
      through: "ResourceCollection",
      foreignKey: "parentId",
      otherKey: "childId",
    });
    Resource.belongsToMany(models.Tag, { as: "Tags", through: "ResourceTags" });
  };
  return Resource;
};
