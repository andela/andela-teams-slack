import jwt from 'jsonwebtoken';

import models from '../models';
import Slack from '../integrations/Slack';

const slack = new Slack();

async function _getFeedbackTable(records) {
  let resolvedUsersMap = new Map();
  let rows = [];
  for (let i = 0; i < records.length; i++) {
    let record = records[i].get();
    let recipientName, senderName;
    if (record.to) {
      if (resolvedUsersMap.has(record.to)) {
        recipientName = resolvedUsersMap.get(record.to);
      } else {
        let user = await slack.resolver.getUserProfileObject(record.to);
        recipientName = user.real_name;
        resolvedUsersMap.set(record.to, user.real_name);
      }
    }
    if (record.from) {
      if (resolvedUsersMap.has(record.from)) {
        senderName = resolvedUsersMap.get(record.from);
      } else {
        let user = await slack.resolver.getUserProfileObject(record.from);
        senderName = user.real_name;
        resolvedUsersMap.set(record.from, user.real_name);
      }
    }
    rows.push({
      ...record,
      recipientName,
      senderName
    });
  }
  return rows;
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
      } else if (query.feedbackAnalyticsType === 'attributes_chart') {
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
        query.attributes = [
          'Attributes.name',
          [models.sequelize.fn('count', models.sequelize.col('id')), 'count']
        ];
        query.group = ['Attributes.name'];
      }
      const records = await models.FeedbackInstance.findAll(query);
      records.forEach(r => console.log(r.get()));
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
