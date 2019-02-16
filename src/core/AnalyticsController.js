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
        let feedback = fdbckInstances[i];
        let recipientName, senderName;
        if (feedback.to) {
          if (resolvedUsersMap.has(feedback.to)) {
            recipientName = resolvedUsersMap.get(feedback.to);
          } else {
            let user = await slack.resolver.getUserProfileObject(feedback.to);
            recipientName = user.real_name;
            resolvedUsersMap.set(feedback.to, user.real_name);
          }
        }
        if (feedback.from) {
          if (resolvedUsersMap.has(feedback.from)) {
            senderName = resolvedUsersMap.get(feedback.from);
          } else {
            let user = await slack.resolver.getUserProfileObject(feedback.from);
            senderName = user.real_name;
            resolvedUsersMap.set(feedback.from, user.real_name);
          }
        }
        feedbackInstances.push({
          ...(feedback.get()),
          recipientName,
          senderName,
          testUndefined: undefined,
          testNull: null
        });
      }
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
