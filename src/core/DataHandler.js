import models from '../models';

async function _getAttributesAndSkills() {
  const allAttributes = await models.Attribute.findAll({
    include: [
      { model: models.Skill, as: 'skills' },
    ]
  });
  let option_groups = allAttributes.map(a => {
    let group = {};
    a = a.get();
    group.id = a.id; // used only for sorting
    group.label = a.name;
    group.options = a.skills.map(s => {
      s = s.get();
      return {
        label: s.name,
        value: s.id
      }
    });
    return group;
  });
  option_groups = option_groups.sort((a, b) => a.id - b.id);
  return { option_groups };
}

export default class DataHandler {
  async dialogSuggestions(req, res, next) {
    try {
      let payload = req.payload;
      if (payload.type === 'dialog_suggestion') {
        if (payload.callback_id.startsWith('record_feedback_dialog:')) {
          const data = await _getAttributesAndSkills();
          res.status(200).json(data);
        }
        return;
      }
      next();
    } catch(error) {
      next(error);
    }
  }
}
