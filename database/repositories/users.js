const User = require("../models").User;
const bcrypt = require("bcrypt");
const rounds = 12;

var UsersRepository = {
  find: async function (username) {
    var user = await User.findOne({
      where: { username: username },
    });

    return user;
  },
  create: async function (user) {
    const passwordHash = await bcrypt.hash(user.password, rounds);
    user.password = passwordHash;

    var createdUser = await User.create(user);

    return createdUser;
  },
};

module.exports = UsersRepository;
