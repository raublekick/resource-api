"use strict";
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const Umzug = require("umzug");
const config = require("../config/config");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const db = {};

let sequelize;
if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

if (env === "development") {
  const umzug = new Umzug({
    migrations: {
      path: "./database/seeders",
      params: [sequelize.getQueryInterface()],
    },
    storage: "sequelize",
    storageOptions: { sequelize },
  });

  (async () => {
    await sequelize.sync({ force: true });
    // Checks migrations and run them if they are not already applied. To keep
    // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
    // will be automatically created (if it doesn't exist already) and parsed.
    await umzug.up();
  })();
}

module.exports = db;
