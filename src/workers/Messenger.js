import request from 'request-promise-native';

export default class Messenger {
  async postLandingPage(req, res) {
    // check request auth
    var actions = [];
    if (req.user && req.user.isAdmin) {
      actions.push({
        name: 'landing_page_menu',
        text: 'Create Team',
        style: 'primary',
        type: 'button',
        value: 'create_team'
      });
    }
    actions.push({
      name: 'landing_page_menu',
      text: 'View Teams',
      type: 'button',
      value: 'view_team'
    });
    actions.push({
      name: 'landing_page_menu',
      text: 'Search Teams',
      type: 'button',
      value: 'search_team'
    });

    // send appropriate controls
    const response = await request({
      url: req.body.response_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        // text: 'What would you like to do?',
        attachments: [{
          callback_id: 'landing_page_menu',
          color: 'good',
          fallback: 'Could not perform operation.',
          // text: '',
          // title: '',
          // title_link: '',
          actions: actions
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
    return response;
  }
}