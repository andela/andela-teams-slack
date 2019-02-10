module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 301,  
      attributeId: 3,
      name: 'Creativity'
    }, {
      id: 302,
      attributeId: 3,
      name: 'Decision making'
    }, {
      id: 303,
      attributeId: 3,
      name: 'Problem solving'
    }, {
      id: 304,
      attributeId: 3,
      name: 'Holistic thinking'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
