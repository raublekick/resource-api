const jwtSecret = require("./jwtConfig");

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  User = require("../database/models").User,
  JWTStrategy = require("passport-jwt").Strategy,
  ExtractJWT = require("passport-jwt").ExtractJwt;

const bcrypt = require("bcrypt");

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({
          where: {
            username: username,
          },
        });
        if (!user) {
          return done("Could not find user.");
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          return done(null, user);
        } else {
          return done("Incorrect Username / Password");
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
  secretOrKey: jwtSecret.secret,
};

passport.use(
  new JWTStrategy(opts, (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done("jwt expired");
    }

    return done(null, jwtPayload);
  })
);
