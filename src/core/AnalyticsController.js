import jwt from 'jsonwebtoken';

import models from '../models';

export default class AnalyticsController {
  async feedback(req, res, next) {console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>')
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      const query2 = {
        where: {
          // createdAt: { 
          //   $gte: new Date('2019-01-13T10:50:34.113Z'),
          //   $lte: new Date('2019-02-17T10:50:33.911Z')
          // }
        },
        //include: [{ all: true, nested: true }]
        include: [{
          model: models.Skill,
          as: 'skill',
          attributes: ['name'],
          required: false
        }]
      }
      const dbres = await models.FeedbackInstance.findAndCountAll();
      console.log(dbres.count);
      const feedbackInstances = await models.FeedbackInstance.findAll(query2);
      return res.status(200).json({ feedbackInstances });
    } catch(error) {
      next(error);
    }
  }
}
