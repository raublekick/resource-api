const Resource = require("../models").Resource;

var ResourceRepository = {
  find: async function (search) {
    var filter = "%" + search + "%";
    let filters = {
      include: [
        {
          model: db.Tag,
          as: "Tags",
        },
      ],
    };

    if (searchsearch) {
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

    return resources;
  },
  findById: async function (id) {
    var resource = await Resource.findByPk(id, {
      include: [
        {
          model: db.Tag,
          as: "Tags",
        },
        {
          model: db.User,
          as: "Owners",
          attributes: ["firstName", "lastName", "username", "email"],
        },
      ],
    });

    return resource;
  },
  create: async function (resource, username) {
    var name = resource.title.toLowerCase().replace(" ", "-").substring(0, 250);
    resource.name = name;
    var createdResource = await Resource.create(resource);

    var tags = [];
    // NOTE: Using a Array.foreach breaks asynchronous
    for (const tag of resource.tags) {
      if (tag.id) {
        tags.push(tag.id);
      } else {
        // add as new tag
        var newTag = await db.Tag.findOrCreate({ where: { name: tag } });
        tags.push(newTag[0].id);
      }
    }

    await createdResource.setOwners([username]);
    await createdResource.setTags(tags);

    return createdResource;
  },
  findCollectionByResourceId: async function (id) {
    var resource = await Resource.findByPk(id, {
      include: ["Collection"],
    });

    return resource.Collection;
  },
  findParentsByResourceId: async function (id) {
    var resources = await Resource.findByPk(req.params.id, {
      include: ["Parents"],
    });

    return resources.Parents;
  },
  findResourcesByUser: async function (username) {
    var resources = await Resource.findAll({
      include: [
        {
          model: db.User,
          as: "Owners",
          attributes: ["firstName", "lastName", "username", "email"],
        },
        // {
        //   model: Resource,
        //   as: "Parents",
        // },
        {
          model: Resource,
          as: "Collection",
          attributes: [],
          include: [
            {
              model: Resource,
              as: "Parents",
              attributes: [],
            },
          ],
        },
      ],
      where: {
        [Op.or]: [
          {
            "$Owners.username$": { [Op.eq]: username },
          },
          // TODO: Verify that this works!
          {
            "$Collection.Parents.id$": { [Op.col]: "Resource.id" },
          },
        ],
      },
    });

    return resources;
  },
  addCollection: async function (parentId, childId, username) {
    // check if resource is owned by user
    var resource = await Resource.findByPk(parentId, {
      include: [
        {
          model: db.Tag,
          as: "Tags",
        },
        {
          model: db.User,
          as: "Owners",
          attributes: ["firstName", "lastName", "username", "email"],
          where: {
            username: username,
          },
        },
      ],
    });

    if (resource != null) {
      await resource.addCollection(childId);
      return true;
    } else {
      // resource not owned by user
      return false;
    }
  },
};

module.exports = ResourceRepository;