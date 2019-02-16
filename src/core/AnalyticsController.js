import jwt from 'jsonwebtoken';

import models from '../models';

export default class AnalyticsController {
  async feedback(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      console.log(query);
      console.log(query.include);
      console.log(query.include[0].through);
      const query2 = {
        where: {
          to: 'G48Q3PJUT',
          type: 'negative',
          createdAt: { 
            $gte: '2019-02-16T10:50:34.113Z',
            $lte: '2019-02-13T10:50:33.911Z'
          }
        },
        include: [{ all: true, nested: true }]
      }
      console.log(query2);
      console.log(query2.include);
      console.log(query2.include[0].through);
      const feedbackInstances = await models.FeedbackInstance.findAll(query2);
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
