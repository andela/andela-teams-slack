import request from 'request-promise-native';

export default class Messenger {
  async postLandingPage(req, res) {
    // get user object so we know what controls to send to the user
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
          actions: [{
            name: 'landing_page_menu',
            text: 'Create Team',
            style: 'primary',
            type: 'button',
            value: 'create_team'
          }, {
            name: 'landing_page_menu',
            text: 'View Teams',
            type: 'button',
            value: 'view_team'
          }, {
            name: 'landing_page_menu',
            text: 'Search Teams',
            type: 'button',
            value: 'search_team'
          }]
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
    return response;
  }

  async postWelcomeMessage(req, res) {
    return res.status(200).send(':wave: Welcome to Andela Teams :celebrate:');
  }
}