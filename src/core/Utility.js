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
  async rejectUsersWithNoEmailOrGithub(req, res, next) {
    // if (req.user && req.user.email && req.user.github_user_name) {
    //   next();
    // } else {
    //   let channelId, userId;
    //   if (req.body.channel_id && req.body.user_id) {
    //     channelId = req.body.channel_id;
    //     userId = req.body.user_id;
    //   } else if (req.body.event) {
    //     channelId = req.body.event.item.channel;
    //     userId = req.body.event.user;
    //   } else if (req.payload) {
    //     channelId = req.payload.channel.id;
    //     userId = req.payload.user.id;
    //   }
    //   if (channelId && userId) { // just in case channelId or userId is still undefined
    //     await slack.chat.postEphemeral(
    //       'Your email address or Github profile cannot be found on Slack',
    //       channelId,
    //       userId,
    //       [{
    //         color: 'danger',
    //         text: 'Ensure there are values for the *Email* and *Github* fields on your Slack profile',
    //       }]);
    //   }
    // }
    next();
  }
}
