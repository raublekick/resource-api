const db = require("../models");
const Op = db.Sequelize.Op;
const Resource = require("../models").Resource;

var ResourceRepository = {
  find: async function (search, username) {
    var filter = "%" + search + "%";
    let privateFilter = {};
    let searchFilter = {};
    let filters = {
      include: [
        {
          model: db.Tag,
          as: "Tags",
        },
      ],
      where: {},
    };

    if (username) {
      filters.include.push({
        model: db.User,
        as: "Owners",
        attributes: [],
      });
      privateFilter = {
        [Op.or]: [
          { private: false },
          {
            "$Owners.username$": { [Op.eq]: username },
          },
        ],
      };
    } else {
      privateFilter = { private: false };
    }

    if (search) {
      console.log(filter);
      searchFilter = {
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

    filters.where = {
      [Op.and]: [privateFilter, searchFilter],
    };
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
    for (const tag of resource.Tags) {
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
  edit: async function (resource, username) {
    var name = resource.title.toLowerCase().replace(" ", "-").substring(0, 250);
    resource.name = name;
    await Resource.update(
      {
        name: name,
        title: resource.title,
        subTitle: resource.subTitle,
        coverPhoto: resource.coverPhoto,
        url: resource.url,
        address: resource.address,
        description: resource.description,
        private: resource.private,
      },
      {
        where: {
          id: resource.id,
        },
      }
    );

    var updatedResource = await this.findById(resource.id);

    var tags = [];
    // NOTE: Using a Array.foreach breaks asynchronous
    for (const tag of resource.Tags) {
      if (tag.id) {
        tags.push(tag.id);
      } else {
        // add as new tag
        var newTag = await db.Tag.findOrCreate({ where: { name: tag } });
        tags.push(newTag[0].id);
      }
    }

    //await updatedResource.setOwners([username]);
    await updatedResource.setTags(tags);

    return updatedResource;
  },
  findCollectionByResourceId: async function (id) {
    var resource = await Resource.findByPk(id, {
      include: ["Collection"],
    });

    return resource.Collection;
  },
  findParentsByResourceId: async function (id) {
    var resources = await Resource.findByPk(id, {
      include: ["Parents"],
    });

    return resources.Parents;
  },
  findResourcesByUser: async function (username, search) {
    var filter = "%" + search + "%";
    let searchFilter = {};
    let ownerFilter = {
      [Op.or]: [
        {
          "$Owners.username$": { [Op.eq]: username },
        },
        // TODO: Verify that this works!
        {
          "$Collection.Parents.id$": { [Op.col]: "Resource.id" },
        },
      ],
    };
    let filters = {
      include: [
        {
          model: db.User,
          as: "Owners",
          attributes: ["firstName", "lastName", "username", "email"],
        },
        {
          model: db.Tag,
          as: "Tags",
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
      where: {},
    };
    if (search) {
      console.log(filter);
      searchFilter = {
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

    filters.where = {
      [Op.and]: [ownerFilter, searchFilter],
    };

    var resources = await Resource.findAll(filters);

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
