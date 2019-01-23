import request from 'request-promise-native';

export default class SlackObjectResolver {
  async getUserObjectFromReqBodyUserId(req, res, next) {
    var user = {};

    // make a request to resolve the user
    let url = 'https://slack.com/api/users.info';
    url += '?user=' + req.body.user_id;
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
    user = data.user || user;

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
    groups.push({ handle: 'simulations-facilitators', users: [req.body.user_id] }); // TODO: remove this line
    let grp = groups.find((g) => g.handle == 'simulations-facilitators');
    user.isAdmin = grp.users.includes(req.body.user_id);

    req.user = user;
    next();
  }
}