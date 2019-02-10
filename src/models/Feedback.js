export default (sequelize, DataTypes) => {
  const Feedback = sequelize.define('FeedbackInstance', {
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

  Feedback.hook('afterSave', (feedback, options) => {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    // delete feedback instances older than 4 months (120 days)
    const r1 = await Feedback.findAll({
      where: {
        //createdAt: { $lt: new Date(new Date() - 120 * 24 * 60 * 60 * 1000) }
        createdAt: { $lt: new Date(new Date() - 60 * 60 * 1000) }
      }
    });
    console.log('<<<<<<<<<<<<1:');console.log(r1);console.log(r1.get())
    const r = await Feedback.destroy({
      where: {
        //createdAt: { $lt: new Date(new Date() - 120 * 24 * 60 * 60 * 1000) }
        createdAt: { $lt: new Date(new Date() - 60 * 60 * 1000) }
      }
    });
    console.log('<<<<<<<<<<<<2:');console.log(r)
  });

  return Feedback;
};
