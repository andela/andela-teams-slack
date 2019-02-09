import Github from '../integrations/Github';
import models from '../models';
import PivotalTracker from '../integrations/PivotalTracker';
import Slack from '../integrations/Slack';

const github = new Github();
const pivotal = new PivotalTracker();
const slack = new Slack();

export default class EventHandler {
  async addMeReaction(req, res, next) {
    try {
      let event = req.body.event;
      if (event.reaction === 'add_me') {
        if (event.item.type === 'message') {
          var messageText = await slack.resolver.getMessageFromChannel(event.item.ts, event.item.channel);
          // check if messageText is a link <...>
          if (messageText.toLowerCase().startsWith('<http') && messageText.endsWith('>')) {
            // trim messageText of < and > to get link
            let messageLink = messageText.substring(1, messageText.length - 1).toLowerCase();
            // ensure the link was created by this app by checking the database
            const existingResource = await models.Resource.findOne({
              where: { url: messageLink }
            });
            if (!existingResource) {
              await slack.chat.postEphemeral(
                `The resource ${messageLink} was not created using Andela Teams.`,
                event.item.channel,
                event.user);
              return;
            }
            if (event.type === 'reaction_added') {
              if (messageLink.includes(`github.com/${process.env.GITHUB_ORGANIZATION}/`)) {
                let repo = messageLink.substring(messageLink.lastIndexOf('/') + 1);
                await github.repo.addUser(req.user.github_user_name, repo);
              } else if (messageLink.includes('pivotaltracker.com/projects/')) {
                let projId = messageLink.substring(messageLink.lastIndexOf('/') + 1);
                await pivotal.project.addUser(req.user.email, projId);
              }
              await slack.chat.postEphemeral(`Confirm you have been added to ${messageLink}`, event.item.channel, event.user);
              return;
            } else if (event.type === 'reaction_removed') {
              if (messageLink.includes(`github.com/${process.env.GITHUB_ORGANIZATION}/`)) {
                let repo = messageLink.substring(messageLink.lastIndexOf('/') + 1);
                await github.repo.removeUser(req.user.github_user_name, repo);
              } else if (messageLink.includes('pivotaltracker.com/projects/')) {
                let projId = messageLink.substring(messageLink.lastIndexOf('/') + 1);
                await pivotal.project.removeUser(req.user.email, projId);
              }
              await slack.chat.postEphemeral(`Confirm you have been removed from ${messageLink}`, event.item.channel, event.user);
              return;
            }
          }
        }
      }
  
      next();
    } catch(error) {
      next(error);
    }
  }
  async challenge(req, res, next) {
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    // if Slack is "challenging" our URL in order to verify it
    if (req.body.challenge) {
      return res.status(200).json({ challenge: req.body.challenge });
    }
    res.status(200).send();
    next();
  }
}
