module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 101,  
      attributeId: 1,
      name: 'Attention to detail'
    }, {
      id: 102,
      attributeId: 1,
      name: 'Requirements Analysis'
    }, {
      id: 103,
      attributeId: 1,
      name: 'Algorithms'
    }, {
      id: 104,
      attributeId: 1,
      name: 'Patterns/MVC'
    }, {
      id: 105,
      attributeId: 1,
      name: 'Data Structures'
    }, {
      id: 106,
      attributeId: 1,
      name: 'Test Driven Development'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
