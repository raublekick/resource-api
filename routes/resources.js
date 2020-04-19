var express = require("express");
var router = express.Router();
var passport = require("passport");
const db = require("../database/models");
const Op = db.Sequelize.Op;
const Resource = require("../database/models").Resource;

/**
 * @swagger
 * definitions:
 *  Resource:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       title:
 *         type: string
 *       subTitle:
 *         type: string
 *       description:
 *         type: string
 *       url:
 *         type: string
 *       address:
 *         type: string
 */

/**
 * @swagger
 * path:
 *  /resources:
 *    get:
 *      summary: Get a list of resources filtered by search
 *      tags: [Resources]
 *      parameters:
 *        - in: query
 *          name: search
 *          type: string
 *          required: false
 *          description: A search string to filter results
 *      responses:
 *        "200":
 *          description: A list of resources filtered by search string
 */
router.get("/", async (req, res, next) => {
  let resources;
  var filter = "%" + req.query.search + "%";
  let filters = {
    include: [
      {
        model: db.Tag,
        as: "Tags",
      },
    ],
  };

  if (req.query.search) {
    console.log(filter);
    filters.where = {
      [Op.or]: [
        {
          name: { [Op.iLike]: filter },
        },
        {
          title: { [Op.iLike]: filter },
        },
        {
          subTitle: { [Op.iLike]: filter },
        },
        {
          description: { [Op.iLike]: filter },
        },
        {
          "$Tags.name$": { [Op.iLike]: filter },
        },
      ],
    };
  }
  resources = await Resource.findAll(filters);
  res.send(resources);
});

/**
 * @swagger
 * path:
 *  /resources/{id}:
 *    get:
 *      summary: Get a resource by id
 *      tags: [Resources]
 *      parameters:
 *        - in: path
 *          name: id
 *          type: string
 *          required: false
 *          description: id of the resource
 *      responses:
 *        "200":
 *          description: A single resource
 */
router.get("/:id", async (req, res, next) => {
  var resource = await Resource.findByPk(req.params.id);
  res.send(resource);
});

/**
 * @swagger
 * path:
 *  /resources/{id}/collection:
 *    get:
 *      summary: Get associated resources for the resource specified by id
 *      tags: [Resources]
 *      parameters:
 *        - in: path
 *          name: id
 *          type: string
 *          required: true
 *          description: id of the resource
 *      responses:
 *        "200":
 *          description: A list of resources
 */
router.get("/:id/collection", async (req, res, next) => {
  var resource = await Resource.findByPk(req.params.id, {
    include: ["Collection"],
  });
  res.send(resource.Collection);
});

/**
 * @swagger
 * path:
 *  /resources/{id}/belongs-to:
 *    get:
 *      summary: Gets resources where the specified ID is a child
 *      tags: [Resources]
 *      parameters:
 *        - in: path
 *          name: id
 *          type: string
 *          required: true
 *          description: id of the resource
 *      responses:
 *        "200":
 *          description: A list of resources
 */
router.get("/:id/belongs-to", async (req, res, next) => {
  var resources = await Resource.findAll({
    include: [
      {
        model: db.Resource,
        as: "Collection",
        where: { "$Collection.id$": req.params.id },
      },
    ],
  });
  res.send(resources);
});

/**
 * @swagger
 * path:
 *  /resources:
 *    post:
 *      summary: Register a new user
 *      tags: [Resources]
 *      parameters:
 *        - in: body
 *          name: resource
 *          description: Resource object
 *          required: true
 *          schema:
 *            $ref: '#definitions/Resource'
 *      responses:
 *        "200":
 *          description: A resource id
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    console.log(req.body);

    const username = req.user.username;

    const resource = req.body;
    try {
      var name = resource.title
        .toLowerCase()
        .replace(" ", "-")
        .substring(0, 250);
      resource.name = name;
      var createdResource = await Resource.create(resource);

      console.log("resource created");
      res
        .status(200)
        .send({ id: createdResource.id, name: createdResource.name });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        error: "Could not create the resource.",
      });
    }
  }
);

module.exports = router;
