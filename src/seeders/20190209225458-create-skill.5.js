module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 501,
      attributeId: 5,
      name: 'Stakeholder management'
    }, {
      id: 502,
      attributeId: 5,
      name: 'Expectations management'
    }, {
      id: 503,
      attributeId: 5,
      name: 'Estimating'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
