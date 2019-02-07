import dotenv from 'dotenv';
import request from 'request-promise-native';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

class Chat {
  async postEphemeral(message, channelId, userId, attachments) {
    try {console.log(process.env.SLACK_USER_TOKEN)
      // post ephemeral message in channel, visible only to user
      let url = 'https://slack.com/api/chat.postEphemeral';
      url += `?token=${process.env.SLACK_USER_TOKEN}`;
      url += `&channel=${channelId}`;
      url += `&user=${userId}`;
      let r = await request({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        formData: JSON.stringify({
          // token: process.env.SLACK_USER_TOKEN,
          // channel: channelId,
          text: message,
          // user: userId,
          attachments
        }),
        resolveWithFullResponse: true
      });
      console.log(r.body);
    } catch (err) {
      console.log(err);
    }
  }
  async postResponse(message, responseUrl, attachments) {
    try {
      await request({
        url: responseUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          text: message,
          attachments
        },
        json: true,
        resolveWithFullResponse: true
      });
    } catch (err) {
      console.log(err);
    }
  }
}

class Dialog {
  async open(triggerId, dialogJson) {
    let url = 'https://slack.com/api/dialog.open';
    await request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      formData: {
        token: process.env.SLACK_USER_TOKEN,
        trigger_id: triggerId,
        dialog: JSON.stringify(dialogJson)
      },
      resolveWithFullResponse: true
    });
  }
}

class Resolver {
  async getMessageFromChannel(ts, channelId) {
    let url = 'https://slack.com/api/conversations.history';
    url += '?channel=' + channelId;
    url += '&latest=' + ts;
    url += '&token=' + process.env.SLACK_USER_TOKEN;
    url += '&inclusive=true&limit=1';
    let response = await request({
      url: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      resolveWithFullResponse: true
    });
    let data = JSON.parse(response.body);
    if (data.ok && data.messages.length > 0) {
      return data.messages[0].text;
    }
    return data; // TODO: what to return otherwise
  }
  async getUserObject(userId) {
    var user;

    try {
      // make a request to resolve the user
      let url = 'https://slack.com/api/users.profile.get'; // 'https://slack.com/api/users.info';
      url += '?user=' + userId;
      url += '&token=' + process.env.SLACK_USER_TOKEN;
      let response = await request({
        url: url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        resolveWithFullResponse: true
      });
      let data = JSON.parse(response.body);
      user = data.profile || user;

      // see if user has github repo in their profile info
      if (user.fields['Xf5LPLTLQ4']) {
        user.github = user.fields['Xf5LPLTLQ4'].value;
        if (user.github.includes('/')) {
          user.github_user_name = user.github.substring(user.github.lastIndexOf('/') + 1);
        } else {
          user.github_user_name = user.github;
        }
      }

      // see if user if part of group @simulations-facilitators
      let groups = [];
      url = 'https://slack.com/api/usergroups.list';
      url += '?include_disabled=false';
      url += '&include_users=true';
      url += '&token=' + process.env.SLACK_USER_TOKEN;
      response = await request({
        url: url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        resolveWithFullResponse: true
      });
      data = JSON.parse(response.body);
      if (data.ok && data.usergroups) {
        groups = data.usergroups;
      }
      let grp = groups.find((g) => g.handle == 'simulations-facilitators');
      if (grp) {
        user.is_sims_facilitator = grp.users.includes(userId);
      }
    } catch (err) {
      console.log(err);
    } finally {
      return user;
    }
  }
}

export default class Slack {
  /**
   * @constructor
   */
  constructor() {
    this.chat = new Chat();
    this.dialog = new Dialog();
    this.resolver = new Resolver();
  }
}