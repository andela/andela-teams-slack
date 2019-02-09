module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Skills', [{
      id: 401,  
      attributeId: 4,
      name: 'Willingness to ask questions'
    }, {
      id: 402,
      attributeId: 4,
      name: 'Seek and request feedback'
    }, {
      id: 403,
      attributeId: 4,
      name: 'Writing professionally'
    }, {
      id: 404,
      attributeId: 4,
      name: 'Speaking to be understood'
    }, {
      id: 405,
      attributeId: 4,
      name: 'Reading to understand'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
