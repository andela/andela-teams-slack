module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Resources', [{
      id: Sequelize.Utils.generateUUID(),
      url: 'https://www.pivotaltracker.com/projects/2313263',  
      userId: 'U4R9RDUCQ'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://www.pivotaltracker.com/projects/2313261',  
      userId: 'U4R9RDUCQ'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://github.com/andela/apollo-ah-backend',  
      userId: 'U4R9RDUCQ'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://github.com/andela/artemis-ah-backend',  
      userId: 'U4R9RDUCQ'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://github.com/andela/apollo-ah-frontend',  
      userId: 'U4R9RDUCQ'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://github.com/andela/artemis-ah-frontend',  
      userId: 'U4R9RDUCQ'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://www.pivotaltracker.com/n/projects/2313265',  
      userId: 'UBP16GXMX'
    }, {
      id: Sequelize.Utils.generateUUID(),
      url: 'https://www.pivotaltracker.com/n/projects/2313267',  
      userId: 'UBP16GXMX'
    }], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Skills', null, {})
};
