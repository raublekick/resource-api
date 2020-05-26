var express = require("express");
var router = express.Router();
var UserService = require("../database/repositories/users");
var passport = require("passport");
var jwtSecret = require("../config/jwtConfig");
var jwt = require("jsonwebtoken");

// TODO: move this to DB
let refreshTokens = [];
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
    var existingUser = await UserService.find(user.username);

    if (existingUser !== null) {
      return res.status(400).send({ error: "User already exists" });
    }
    var createdUser = await UserService.create(user);

    const payload = {
      username: createdUser.username,
      expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
    };

    /** assigns payload to req.user */
    req.login(payload, { session: false }, (error) => {
      if (error) {
        return res.status(400).send({ error });
      }

      /** generate a signed json web token and return it in the response */
      const token = createAuthToken(user);
      const refresh = createRefreshToken(user);
      // TODO: Move this to DB
      refreshTokens.push(refresh);

      /** assign our jwt to the cookie */
      return res.status(200).send({
        auth: true,
        token: token,
        refreshToken: refresh,
        user: {
          username: createdUser.username,
          lang: createdUser.lang,
        },
      });
    });
  } catch (error) {
    return res.status(400).send({
      error: "req body should take the form { username, password }",
    });
  }
});

/**
 * @swagger
 * path:
 *  /auth/token:
 *    post:
 *      summary: Refreshes auth token
 *      tags: [Auth]
 *      parameters:
 *        - in: body
 *          name: token
 *          description: The refresh token
 *          type: string
 *          required: true
 *      responses:
 *        "200":
 *          description: Returns a new auth token
 */
router.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) {
    return res.sendStatus(401);
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }
  jwt.verify(refreshToken, jwtSecret.refreshSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const token = createAuthToken(user);
    res.json({ token: token });
  });
});

/**
 * @swagger
 * path:
 *  /auth/token:
 *    post:
 *      summary: Logs out the user and deletes refresh token
 *      tags: [Auth]
 *      parameters:
 *        - in: body
 *          name: token
 *          description: The refresh token
 *          type: string
 *          required: true
 *      responses:
 *        "204":
 *          description: Indicates user successfully logged out
 */
router.delete("/logout", async (req, res) => {
  // TODO: move this to DB
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
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
    if (error | !user) {
      return res.status(400).json({ error: error });
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
      const token = createAuthToken(user);
      const refresh = createRefreshToken(user);
      // TODO: Move this to DB
      refreshTokens.push(refresh);

      /** assign our jwt to the cookie */
      res.status(200).send({
        auth: true,
        token: token,
        refreshToken: refresh,
        user: {
          username: user.username,
          lang: user.lang,
        },
      });
    });
  })(req, res);
});

function createAuthToken(user) {
  const payload = {
    username: user.username,
    expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
  };

  const token = jwt.sign(JSON.stringify(payload), jwtSecret.secret);

  return token;
}

function createRefreshToken(user) {
  const payload = {
    username: user.username,
  };

  const token = jwt.sign(JSON.stringify(payload), jwtSecret.refreshSecret);

  return token;
}

module.exports = router;
