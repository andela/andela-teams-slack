export default (sequelize, DataTypes) => {
  const Resource = sequelize.define('Resource', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING
    },
    userId: {
      allowNull: false,
      type: DataTypes.STRING
    }
  });

  Resource.associate = (models) => {};

  Resource.hook('afterCreate', (resource, options) => {
    // delete resources older than 4 months (120 days)
    return Resource.destroy({
      where: {
        createdAt: { $lt: new Date(new Date() - 120 * 24 * 60 * 60 * 1000) }
      }
    })
  });

  return Resource;
};
