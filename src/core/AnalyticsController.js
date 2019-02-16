import jwt from 'jsonwebtoken';

import models from '../models';

export default class AnalyticsController {
  async feedback(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      console.log(query);
      // because include.model seems to be lost during encoding, I recreate it
      // after decoding
      if (query.include && query.include[0]) {
        query.include[0].model = models.Skill;
        if (query.include[0].include && query.include[0].include[0]) {
          query.include[0].include[0].model = models.Attribute;
        }
      }
      console.log(query);
      const feedbackInstances = await models.FeedbackInstance.findAll(query);
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
