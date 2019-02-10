module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 601,  
      attributeId: 6,
      name: 'Relationship Building'
    }, {
      id: 602,
      attributeId: 6,
      name: 'Team Dynamics'
    }, {
      id: 603,
      attributeId: 6,
      name: 'Cultural Awareness'
    }, {
      id: 604,
      attributeId: 6,
      name: 'Adaptability'
    }, {
      id: 605,
      attributeId: 6,
      name: 'Leadership'
    }, {
      id: 606,
      attributeId: 6,
      name: 'Mentorship'
    }, {
      id: 607,
      attributeId: 6,
      name: 'Vision Alignment'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
