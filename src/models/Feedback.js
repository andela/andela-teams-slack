export default (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    context: {
      allowNull: true,
      type: DataTypes.TEXT('long')
    },
    from: {
      allowNull: false,
      type: DataTypes.STRING
    },
    message: {
      allowNull: false,
      type: DataTypes.TEXT('long')
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'Skills',
        key: 'id',
        as: 'skillId',
      },
    },
    to: {
      allowNull: true,
      type: DataTypes.STRING
    }
  });

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Skill, {
      as: 'skill',
      foreignKey: 'skillId',
      onDelete: 'CASCADE'
    });
  };

  return Feedback;
};
