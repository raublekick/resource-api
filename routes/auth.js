var express = require("express");
var router = express.Router();
var User = require("../database/models").User;
var passport = require("passport");
var jwtSecret = require("../config/jwtConfig");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rounds = 12;
/**
 * @swagger
 * definitions:
 *  NewUser:
 *     type: object
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *  User:
 *    allOf:
 *      - $ref: '#/definitions/NewUser'
 *      - properties:
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *          email:
 *            type: string
 *          lang:
 *            type: string
 */

/**
 * @swagger
 * path:
 *  /auth/register:
 *    post:
 *      summary: Register a new user
 *      tags: [Auth]
 *      parameters:
 *        - in: body
 *          name: user
 *          description: User object
 *          type: string
 *          required: true
 *          schema:
 *            $ref: '#definitions/User'
 *      responses:
 *        "200":
 *          description: A users object
 */
router.post("/register", async (req, res) => {
  const user = req.body;
  try {
    const passwordHash = await bcrypt.hash(user.password, rounds);
    user.password = passwordHash;

    var createdUser = await User.create(user);

    console.log("user created");
    res.status(200).send({ username: createdUser.username });
  } catch (error) {
    res.status(400).send({
      error: "req body should take the form { username, password }",
    });
  }
});

/**
 * @swagger
 * path:
 *  /auth/login:
 *    post:
 *      summary: Logs in a user
 *      tags: [Auth]
 *      parameters:
 *        - in: body
 *          name: user
 *          description: User object
 *          type: string
 *          required: true
 *          schema:
 *            $ref: '#definitions/User'
 *      responses:
 *        "200":
 *          description: Valid auth response
 */
router.post("/login", (req, res) => {
  passport.authenticate("login", { session: false }, (error, user) => {
    if (error || !user) {
      res.status(400).json({ error });
    }

    /** This is what ends up in our JWT */
    const payload = {
      username: user.username,
      expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
    };

    /** assigns payload to req.user */
    req.login(payload, { session: false }, (error) => {
      if (error) {
        res.status(400).send({ error });
      }

      /** generate a signed json web token and return it in the response */
      const token = jwt.sign(JSON.stringify(payload), jwtSecret.secret);

      /** assign our jwt to the cookie */
      res.status(200).send({
        auth: true,
        token: token,
        message: "user found & logged in",
      });
    });
  })(req, res);
});

/**
 * @swagger
 * path:
 *  /auth/find:
 *    post:
 *      summary: Finds a user
 *      tags: [Auth]
 */
router.get("/find", (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.log(err);
    }
    if (info !== undefined) {
      console.log(info.message);
      res.send(info.message);
    } else {
      console.log("user found in db from route");
      res.status(200).send({
        auth: true,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        lang: user.lang,
        username: user.username,
        password: user.password,
        message: "user found in db",
      });
    }
  })(req, res, next);
});

module.exports = router;
