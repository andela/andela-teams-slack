import jwt from 'jsonwebtoken';

import models from '../models';

export default class AnalyticsController {
  async feedback(req, res, next) {
    try {
      let token = req.params.token;
      console.log(token);
      const query = jwt.verify(token, process.env.JWT_SECRET);
      console.log(query);
      const feedbackInstances = await models.FeedbackInstance.findAll(query);
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
