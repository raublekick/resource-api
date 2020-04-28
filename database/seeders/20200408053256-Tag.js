// "use strict";

// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     return queryInterface
//       .bulkInsert(
//         "Tags",
//         [
//           {
//             id: 1,
//             name: "Garfield",
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           },
//           {
//             id: 2,
//             name: "Neighborhood",
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           },
//         ],
//         {}
//       )
//       .then((result) => {
//         return queryInterface.bulkInsert(
//           "ResourceTags",
//           [
//             {
//               ResourceId: 1,
//               TagId: 1,
//               createdAt: new Date(),
//               updatedAt: new Date(),
//             },
//             {
//               ResourceId: 1,
//               TagId: 2,
//               createdAt: new Date(),
//               updatedAt: new Date(),
//             },
//             {
//               ResourceId: 2,
//               TagId: 2,
//               createdAt: new Date(),
//               updatedAt: new Date(),
//             },
//             {
//               ResourceId: 3,
//               TagId: 1,
//               createdAt: new Date(),
//               updatedAt: new Date(),
//             },
//           ],
//           {}
//         );
//       });
//   },

//   down: (queryInterface, Sequelize) => {
//     return queryInterface.bulkDelete("Tags", null, {});
//   },
// };
