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

  return Resource;
};
