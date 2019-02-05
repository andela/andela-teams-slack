import Slack from '../integrations/Slack';

const slack = new Slack();

export default class Utility {
  async getUserObjectFromReqBodyEventUser(req, res, next) {
    var user = await slack.resolver.getUserObject(req.body.event.user);
    req.user = user;
    next();
  }
  async getUserObjectFromReqBodyPayloadUserId(req, res, next) {
    const payload = JSON.parse(req.body.payload);
    req.payload = payload;
    var user = await slack.resolver.getUserObject(payload.user.id);
    req.user = user;
    next();
  }
  async getUserObjectFromReqBodyUserId(req, res, next) {
    var user = await slack.resolver.getUserObject(req.body.user_id);
    req.user = user;
    next();
  }
  async postEmptyMessage(req, res, next) {
    res.status(200).send();
    next();
  }
  async postWelcomeMessage(req, res, next) {
    res.status(200).send(':wave: Welcome to Andela Teams :welcome_:');
    next();
  }
}