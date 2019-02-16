import moment from 'moment';
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

function _getDates() {
  let dateMap = new Map();
  for (let i = 0; i <= 90; i++) {
    let date = moment().subtract(i, 'days');
    let monthName = date.format('MMMM');
    if (dateMap.has(monthName)) {
      console.log('dateMap.get(monthName)>>>>>>>>>>>>>>>>>>>>>>>>>');console.log(dateMap.get(monthName))
      dateMap.set(monthName, dateMap.get(monthName).push(date))
    } else {
      dateMap.set(monthName, [date])
    }
  }
  console.log('dateMap>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');console.log(dateMap)
  let option_groups = [];
  for (let [monthName, dates] of dateMap) {
    let group = {};
    group.label = monthName;
    group.options = dates.map(d => {
      return {
        label: d.format('dddd, MMMM Do YYYY'),
        value: d.toDate()
      }
    });
    option_groups.push(group);
  }
  console.log('option_groups>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');console.log(option_groups)
  return { option_groups };
}

export default class DataHandler {
  async dialogSuggestions(req, res, next) {
    try {
      let payload = req.payload;
      if (payload.type === 'dialog_suggestion') {
        if (payload.callback_id === 'feedback_analytics_dialog') {
          const data = _getDates();
          res.status(200).json(data);
        } else if (payload.callback_id.startsWith('record_feedback_dialog:')) {
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
