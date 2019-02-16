import jwt from 'jsonwebtoken';

import models from '../models';
import Slack from '../integrations/Slack';

const slack = new Slack();

export default class AnalyticsController {
  async feedback(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      // because include.model seems to be lost during encoding, I recreate it
      // after decoding
      if (query.include && query.include[0]) {
        query.include[0].model = models.Skill;
        if (query.include[0].include && query.include[0].include[0]) {
          query.include[0].include[0].model = models.Attribute;
        }
      }
      let query2 = {
        attributes: [
          'createdAt'
          [models.sequelize.fn('count', models.sequelize.col('id')), 'count']
        ],
        group: ['createdAt']
      };
      const records = await models.FeedbackInstance.findAll(query2);
      let resolvedUsersMap = new Map();
      let rows = [];
      for (let i = 0; i < records.length; i++) {
        let record = records[i];
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
          ...(record.get()),
          recipientName,
          senderName
        });
      }
      return res.status(200).json({ rows });
    } catch(error) {
      next(error);
    }
  }
}
