import jwt from 'jsonwebtoken';

import models from '../models';

export default class AnalyticsController {
  async feedback(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      const query2 = {
        where: {
          createdAt: { 
            $gte: '2019-01-13T10:50:34.113Z',
            $lte: '2019-02-17T10:50:33.911Z'
          }
        },
        include: [{ all: true, nested: true }]
      }
      const feedbackInstances = await models.FeedbackInstance.findAll(query2);
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
