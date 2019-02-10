module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 201,  
      attributeId: 2,
      name: 'Developer tools'
    }, {
      id: 202,
      attributeId: 2,
      name: 'Business tools'
    }, {
      id: 203,
      attributeId: 2,
      name: 'Project Management tools'
    }, {
      id: 204,
      attributeId: 2,
      name: 'Communication tools'
    }, {
      id: 205,
      attributeId: 2,
      name: 'Focus and concentration'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
