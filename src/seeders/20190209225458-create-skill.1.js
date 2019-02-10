module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 101,  
      attributeId: 1,
      name: 'Attention to Detail'
    }, {
      id: 102,
      attributeId: 1,
      name: 'Algorithms'
    }, {
      id: 103,
      attributeId: 1,
      name: 'Date Structures'
    }, {
      id: 104,
      attributeId: 1,
      name: 'Test-Driven Development'
    }, {
      id: 105,
      attributeId: 1,
      name: 'Discrete Math'
    }, {
      id: 106,  
      attributeId: 1,
      name: 'Order of Operations'
    }, {
      id: 107,
      attributeId: 1,
      name: 'Object-Oriented Programming'
    }, {
      id: 108,
      attributeId: 1,
      name: 'HTML/CSS'
    }, {
      id: 109,
      attributeId: 1,
      name: 'Version control'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
