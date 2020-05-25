require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
};
