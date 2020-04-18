var express = require("express");
var router = express.Router();

/**
 * @swagger
 * path:
 *  /users:
 *    get:
 *      summary: Get all users
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A list of users objects
 */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/**
 * @swagger
 * path:
 *  /users/{userId}:
 *    get:
 *      summary: Get a user by id
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: userId
 *          type: string
 *          required: true
 *          description: Id of the user
 *      responses:
 *        "200":
 *          description: A users object
 */
router.get("/:userId", function (req, res, next) {
  res.send(req.params);
});

module.exports = router;
