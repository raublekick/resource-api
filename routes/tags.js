var express = require("express");
var router = express.Router();
var passport = require("passport");
const db = require("../database/models");
const Op = db.Sequelize.Op;
const Tag = require("../database/models").Tag;

/**
 * @swagger
 * definitions:
 *  Tag:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 */

/**
 * @swagger
 * path:
 *  /tags:
 *    get:
 *      summary: Get a list of tags filtered by search
 *      tags: [Tags]
 *      parameters:
 *        - in: query
 *          name: search
 *          type: string
 *          required: false
 *          description: A search string to filter results
 *      responses:
 *        "200":
 *          description: A list of tags filtered by search string
 */
router.get("/", async (req, res, next) => {
  let tags;
  var filter = "%" + req.query.search + "%";
  let filters = {};

  if (req.query.search) {
    console.log(filter);
    filters.where = {
      name: { [Op.iLike]: filter },
    };
  }
  tags = await Tag.findAll(filters);
  res.send(tags);
});

module.exports = router;
