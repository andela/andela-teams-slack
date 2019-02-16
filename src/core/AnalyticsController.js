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
      const fdbckInstances = await models.FeedbackInstance.findAll(query);
      let resolvedUsersMap = new Map();
      let feedbackInstances = [];
      for (let i = 0; i < fdbckInstances.length; i++) {
        let recipientName, senderName;
        if (resolvedUsersMap.has(fdbckInstances[i].to)) {
          recipientName = resolvedUsersMap.get(fdbckInstances[i].to);
        } else {
          let user = await slack.resolver.getUserProfileObject(fdbckInstances[i].to);
          recipientName = user.real_name;
          resolvedUsersMap.set(fdbckInstances[i].to, user.real_name);
        }
        if (resolvedUsersMap.has(fdbckInstances[i].from)) {
          senderName = resolvedUsersMap.get(fdbckInstances[i].from);
        } else {
          let user = await slack.resolver.getUserProfileObject(fdbckInstances[i].from);
          senderName = user.real_name;
          resolvedUsersMap.set(fdbckInstances[i].from, user.real_name);
        }
        feedbackInstances.push({
          ...(fdbckInstances[i].get()),
          recipientName,
          senderName
        });
      }
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
