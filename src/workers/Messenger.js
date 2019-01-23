import request from 'request-promise-native';

async function _openDialogForCreateTeam(req, res) {
  let url = 'https://slack.com/api/dialog.open';
  const response = await request({
    url: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    formData: {
      token: process.env.SLACK_USER_TOKEN,
      trigger_id: req.payload.trigger_id,
      dialog: JSON.stringify({
        callback_id: 'create_team_dialog',
        title: 'Create Team',
        submit_label: 'Create',
        state: 'Limo',
        elements: [
          {
            type: 'text',
            label: 'Team Name',
            name: 'team_name'
          },
          {
            type: 'text',
            label: 'Description',
            name: 'team_desc',
            optional: true
          },
          {
            type: 'text',
            label: 'Project',
            name: 'team_project'
          },
          {
            type: 'select',
            label: 'Team Visibility',
            name: 'team_visibility',
            value: 'public',
            options: [{
              label: 'Public',
              value: 'public'
            }, {
              label: 'Private',
              value: 'private'
            }]
          }
        ]
      })
    },
    resolveWithFullResponse: true
  });
  return response;
}

export default class Messenger {
  async openDialog(req, res){
    const payload = JSON.parse(req.body.payload);
    req.payload = payload;
    if (payload.type === 'interactive_message') {
      const value = payload.actions[0].value;
      if (payload.type === 'interactive_message' && value === 'create_team') {
        _openDialogForCreateTeam(req, res);
      }
    } else if (payload.type === 'dialog_submission') {
      const submission = payload.submission;
    //   { team_name: 'Alpha',
    //  team_desc: 'First team',
    //  team_project: 'ah',
    //  team_visibility: 'public' }
      // make API call here
      // ask for github repos
      // ask for PT boards
    }
  }

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