import jwt from 'jsonwebtoken';

import models from '../models';
import Slack from '../integrations/Slack';

const slack = new Slack();

async function _getFeedbackTable(records) {
  let resolvedUsersMap = new Map();
  let rows = [];console.log(`${records.length} records found`)
  for (let i = 0; i < records.length; i++) {console.log(`interation number ${i+1}`)
    let record = records[i];console.log('record:', record.get())
    let recipientName, senderName;
    if (record.to) {console.log('entered record.to:', record.to)
      if (resolvedUsersMap.has(record.to)) {console.log('record.to previously cached')
        recipientName = resolvedUsersMap.get(record.to);console.log('recipientName:', recipientName)
      } else {console.log('record.to not yet cached')
        let user = await slack.resolver.getUserProfileObject(record.to);
        recipientName = user.real_name;console.log('recipientName:', recipientName)
        resolvedUsersMap.set(record.to, user.real_name);console.log('record.to now cached', resolvedUsersMap);
      }
    }
    if (record.from) {console.log('entered record.from:', record.from)
      if (resolvedUsersMap.has(record.from)) {console.log('record.from previously cached')
        senderName = resolvedUsersMap.get(record.from);console.log('senderName:', senderName)
      } else {console.log('record.from not yet cached')
        let user = await slack.resolver.getUserProfileObject(record.from);
        senderName = user.real_name;console.log('senderName:', senderName)
        resolvedUsersMap.set(record.from, user.real_name);console.log('record.from now cached', resolvedUsersMap);
      }
    }
    rows.push({
      ...(record.get()),
      recipientName,
      senderName
    });
    console.log('final rows before return:', rows)
    return rows;
  }
}

function _getFeedbackTimeDistribution(records) {
  let dateGroupsMap = new Map();
  let totalCount = 0;
  for (let i = 0; i < records.length; i++) {
    let record = records[i].get();
    if (dateGroupsMap.has(record.createdAt)) {
      dateGroupsMap.set(
        record.createdAt,
        Number(dateGroupsMap.get(record.createdAt)) + Number(record.count));
    } else {
      dateGroupsMap.set(record.createdAt, Number(record.count));
    }
    totalCount += Number(record.count);
  }
  let rows = [];
  for (let [createdAt, count] of dateGroupsMap) {
    rows.push({
      createdAt,
      count,
      percent: (Number(count) / totalCount) * 100
    });
  }
  return rows;
}

export default class AnalyticsController {
  async feedback(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      if (query.feedbackAnalyticsType === 'feedback_table') {
        query.include = [{
          model: models.Skill,
          as: 'skill',
          attributes: ['name'],
          include: [{
            model: models.Attribute,
            as: 'attribute',
            attributes: ['name'],
          }]
        }];
      } else if (query.feedbackAnalyticsType === 'feedback_time_distribution') {
        query.attributes = [
          [models.sequelize.fn('date', models.sequelize.col('createdAt')), 'createdAt'],
          [models.sequelize.fn('count', models.sequelize.col('id')), 'count']
        ];
        query.group = ['createdAt'];
      }
      const records = await models.FeedbackInstance.findAll(query);
      let rows = [];
      if (query.feedbackAnalyticsType === 'feedback_table') {
        rows = await _getFeedbackTable(records);
      } else if (query.feedbackAnalyticsType === 'feedback_time_distribution') {
        rows = _getFeedbackTimeDistribution(records);
      }
      return res.status(200).json({ rows });
    } catch(error) {
      next(error);
    }
  }
}
