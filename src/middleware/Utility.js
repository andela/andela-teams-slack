import SlackObjectResolver from '../workers/SlackObjectResolver';

const resolver = new SlackObjectResolver();

export default class Utility {
  async getUserObjectFromReqBodyUserId(req, res, next) {
    var user = await resolver.getUserObject(req.body.user_id);
    req.user = user;
    next();
  }
  async getUserObjectFromReqPayloadUser(req, res, next) {
    const payload = JSON.parse(req.body.payload);
    req.payload = payload;
    var user = await resolver.getUserObject(payload.user.id);
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