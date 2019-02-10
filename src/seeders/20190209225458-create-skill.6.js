module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 601,  
      attributeId: 6,
      name: 'Relationship building'
    }, {
      id: 602,
      attributeId: 6,
      name: 'Team dynamics'
    }, {
      id: 603,
      attributeId: 6,
      name: 'Motivation and commitment'
    }, {
      id: 604,
      attributeId: 6,
      name: 'Cultural awareness'
    }, {
      id: 605,
      attributeId: 6,
      name: 'Adaptability'
    }, {
      id: 606,
      attributeId: 6,
      name: 'Leadership'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
