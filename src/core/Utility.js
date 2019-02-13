import Github from '../integrations/Github';
import models from '../models';
import PivotalTracker from '../integrations/PivotalTracker';
import Slack from '../integrations/Slack';

const github = new Github();
const pivotal = new PivotalTracker();
const slack = new Slack();

export default class Utility {
  async addOrRemoveUser(url, user, userId, channelId, addUser = false) {
    // ensure the link was created by this app by checking the database
    const existingResource = await models.Resource.findOne({
      where: { url }
    });
    if (!existingResource) {
      await slack.chat.postEphemeral(
        `The resource ${url} was not created using Andela Teams.`,
        channelId,
        userId);
      return;
    }

    if (addUser) {
      if (url.includes(`github.com/${process.env.GITHUB_ORGANIZATION}/`)) {
        let repo = url.substring(url.lastIndexOf('/') + 1);
        await github.repo.addUser(user.github_user_name, repo);
      } else if (url.includes('pivotaltracker.com/projects/')) {
        let projId = url.substring(url.lastIndexOf('/') + 1);
        await pivotal.project.addUser(user.email, projId);
      }
      await slack.chat.postEphemeral(`Confirm you have been added to ${url}`, channelId, userId);
      return;
    } else {
      if (url.includes(`github.com/${process.env.GITHUB_ORGANIZATION}/`)) {
        let repo = url.substring(url.lastIndexOf('/') + 1);
        await github.repo.removeUser(user.github_user_name, repo);
      } else if (url.includes('pivotaltracker.com/projects/')) {
        let projId = url.substring(url.lastIndexOf('/') + 1);
        await pivotal.project.removeUser(user.email, projId);
      }
      await slack.chat.postEphemeral(`Confirm you have been removed from ${url}`, channelId, userId);
      return;
    }
  }
  async getUserObjectFromReqBodyEventUser(req, res, next) {
    try {
      var user = await slack.resolver.getUserObject(req.body.event.user);
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
      var user = await slack.resolver.getUserObject(payload.user.id);
      req.user = user;
      next();
    } catch(error) {
      next(error);
    }
  }
  async getUserObjectFromReqBodyUserId(req, res, next) {
    try {
      var user = await slack.resolver.getUserObject(req.body.user_id);
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
        if (req.body.event
          && req.body.event.reaction === 'add_me') {
          channelId = req.body.event.item.channel;
          userId = req.body.event.user;
        } else if (req.payload) {
          channelId = req.payload.channel.id;
          userId = req.payload.user.id;
        } else if (req.body.channel_id && req.body.user_id) {
          channelId = req.body.channel_id;
          userId = req.body.user_id;
        }
        if (channelId && userId) {
          await slack.chat.postEphemeral(
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
    res.status(200).send(':wave: Welcome to Andela Teams :welcome_:');
    next();
  }
  async rejectUsersWithNoEmailOrGithub(req, res, next) {
    try {
      if (req.user && req.user.email && req.user.github_user_name) {
        next();
      } else {
        let channelId, userId;
        if (req.body.event
          && req.body.event.reaction === 'add_me') {
          channelId = req.body.event.item.channel;
          userId = req.body.event.user;
        } else if (req.payload) {
          channelId = req.payload.channel.id;
          userId = req.payload.user.id;
        } else if (req.body.channel_id && req.body.user_id) {
          channelId = req.body.channel_id;
          userId = req.body.user_id;
        }
        if (channelId && userId) {
          await slack.chat.postEphemeral(
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