import Slack from '../integrations/Slack';

const slack = new Slack();

export default class Utility {
  async getUserObjectFromReqBodyEventUser(req, res, next) {
    try {
      var user = await slack.resolver.getUserProfileObject(req.body.event.user);
      req.user = user;
      next();
    } catch(error) {
      next(error);
    }
  }
  async getUserObjectFromReqBodyPayloadUserId(req, res, next) {
    try {
      const payload = JSON.parse(req.body.payload);
      req.payload = payload;
      var user = await slack.resolver.getUserProfileObject(payload.user.id);
      req.user = user;
      next();
    } catch(error) {
      next(error);
    }
  }
  async getUserObjectFromReqBodyUserId(req, res, next) {
    try {
      var user = await slack.resolver.getUserProfileObject(req.body.user_id);
      req.user = user;
      next();
    } catch(error) {
      next(error);
    }
  }
  async handleErrors(err, req, res, next) {
    try {
      if (err) {
        let channelId, userId;
        if (req.payload) {
          channelId = req.payload.channel.id;
          userId = req.payload.user.id;
        } else if (req.body.channel_id && req.body.user_id) {
          channelId = req.body.channel_id;
          userId = req.body.user_id;
        }
        if (channelId && userId) {
          await slack.chat.postEphemeralOrDM(
            err.message || err,
            channelId,
            userId);
        }
      }
    } catch(error) {
      next(error);
    }
  }
  async postEmptyMessage(req, res, next) {
    res.status(200).send();
    next();
  }
  async postWelcomeMessage(req, res, next) {
    res.status(200).send(':wave: Welcome to Feedback Bot :welcome_:');
    next();
  }
  async rejectUsersWithNoEmailOrGithub(req, res, next) {
    try {
      if (req.user && req.user.email && req.user.github_user_name) {
        next();
      } else {
        let channelId, userId;
        if (req.payload) {
          channelId = req.payload.channel.id;
          userId = req.payload.user.id;
        } else if (req.body.channel_id && req.body.user_id) {
          channelId = req.body.channel_id;
          userId = req.body.user_id;
        }
        if (channelId && userId) {
          await slack.chat.postEphemeralOrDM(
            'Your email address or Github profile cannot be found on Slack',
            channelId,
            userId,
            [{
              color: 'danger',
              text: 'Ensure there are values for the *Email* and *Github* fields on your Slack profile',
            }]);
        }
      }
    } catch(error) {
      next(error);
    }
  }
}
