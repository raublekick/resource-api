var express = require("express");
var router = express.Router();
var passport = require("passport");
var ResourceService = require("../database/repositories/resources");

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
  let resources = ResourceService.find(req.params.search);
  return res.send(resources);
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
  let resource = ResourceService.findById(req.params.id);
  return res.send(resource);
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
  var collection = ResourceService.findCollectionByResourceId(req.params.id);
  return res.send(collection);
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
  let parents = ResourceService.findParentsByResourceId(req.params.id);
  return res.send(parents);
});

/**
 * @swagger
 * path:
 *  /users/resources:
 *    get:
 *      summary: Get resources for the logged in user
 *      tags: [Resources]
 *      responses:
 *        "200":
 *          description: A list of resources associated to the user
 */
router.get(
  "/user/resources",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      var resources = ResourceService.findResourcesByUser(req.user.username);
      return res.status(200).send(resources);
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        error: "Could not retrieve resources.",
      });
    }
  }
);

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
      let createdResource = ResourceService.create(resource, username);

      console.log("resource created");
      return res
        .status(200)
        .send({ id: createdResource.id, name: createdResource.name });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        error: "Could not create the resource.",
      });
    }
  }
);

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
  "/collection",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      let createdCollection = ResourceService.addCollection(
        req.body.parentId,
        req.body.childId,
        usernareq.user.usernameme
      );

      if (createdCollection) {
        console.log("resource created");
        return res.status(200).send({ parentId: parentId, childId: childId });
      } else {
        return res.status(400).send({ error: "You do not own this resource" });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        error: "Could not create the resource.",
      });
    }
  }
);

module.exports = router;
