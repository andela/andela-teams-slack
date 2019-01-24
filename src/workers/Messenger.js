import request from 'request-promise-native';

import Helpers from './Helpers';

const helpers = new Helpers();

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
        state: 'create_team_dialog',
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

async function _postCreateGithubReposPage(req, res) {
  let submission = req.payload.submission;
  var teamName = submission.team_name;
  teamName = helpers.formatWord(teamName);
  var teamProject = submission.team_project || 'Authors Haven';
  teamProject = helpers.getInitials(teamProject);
  let suggeestedNames = helpers.githubConventions(teamName, teamProject);

  var actions = [];
  var i = 0;
  for (i = 0; i <= suggeestedNames.length; i++) {
    actions.push({
      name: 'create_github_repo',
      text: suggeestedNames[i],
      type: 'button',
      value: `create_github_repo:${suggeestedNames[i]}`
    });
  }
  actions.push({
    name: 'create_github_repo',
    text: 'Custom...',
    style: 'primary',
    type: 'button',
    value: 'create_github_repo:?'
  });

  // since slack allows a max of 5 action buttons, I'll split them
  await request({
    url: req.payload.response_url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      text: 'Click buttons to create Github repos',
      attachments: [{
        callback_id: 'create_github_repo',
        color: 'good',
        fallback: 'Could not perform operation.',
        // text: '',
        // title: '',
        // title_link: '',
        actions: actions.slice(0, 3)
      }]
    },
    json: true,
    resolveWithFullResponse: true
  });
  await request({
    url: req.payload.response_url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      // text: 'Click buttons to create Github repos',
      attachments: [{
        callback_id: 'create_github_repo',
        color: 'good',
        fallback: 'Could not perform operation.',
        // text: '',
        // title: '',
        // title_link: '',
        actions: actions.slice(3, 6)
      }]
    },
    json: true,
    resolveWithFullResponse: true
  });
  await request({
    url: req.payload.response_url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      // text: 'Click buttons to create Github repos',
      attachments: [{
        callback_id: 'create_github_repo',
        color: 'good',
        fallback: 'Could not perform operation.',
        // text: '',
        // title: '',
        // title_link: '',
        actions: actions.slice(6)
      }]
    },
    json: true,
    resolveWithFullResponse: true
  });
}

async function _postCreatePtBoardPage(req, res) {
  let submission = req.payload.submission;
  var teamName = submission.team_name;
  teamName = helpers.formatWord(teamName);
  var teamProject = submission.team_project || 'Authors Haven';
  teamProject = helpers.getInitials(teamProject);
  let suggeestedNames = helpers.ptConventions(teamName, teamProject);

  var actions = [];
  var i = 0;
  for (i = 0; i <= suggeestedNames.length; i++) {
    actions.push({
      name: 'create_pt_project',
      text: suggeestedNames[i],
      type: 'button',
      value: `create_pt_project:${suggeestedNames[i]}`
    });
  }
  actions.push({
    name: 'create_pt_project',
    text: 'Custom...',
    style: 'primary',
    type: 'button',
    value: 'create_pt_project:?'
  });

  await request({
    url: req.payload.response_url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      text: 'Click buttons to create Pivotal Tracker projects',
      attachments: [{
        callback_id: 'create_pt_project',
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
}

async function _postGithubRepoLink(req, res) {
  // call github API with user's github username (add middleware resolver.getUserObjectFromReqPayloadUser)

  await request({
    url: req.payload.response_url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      text: 'Github repo created',
      attachments: [{
        // callback_id: 'create_pt_project',
        color: 'good',
        text: `http://github.com/andela/${req.repoName}`, // TODO: replace with returned link
        // title: '',
        // title_link: ''
      }]
    },
    json: true,
    resolveWithFullResponse: true
  });
}

export default class Messenger {
  async openDialog(req, res){
    const payload = JSON.parse(req.body.payload);
    req.payload = payload;
    if (payload.type === 'interactive_message') {
      const value = payload.actions[0].value;
      if (value === 'create_team') {
        _openDialogForCreateTeam(req, res);
      } else if (value.startsWith('create_github_repo:')) {
        let repoName = value.substring(19);console.log(repoName)
        if (repoName === '?') {
          // TODO: show create github repo dialog
        } else {
          req.repoName = repoName;
          _postGithubRepoLink(req, res);
        }
      }
    } else if (payload.type === 'dialog_submission') {
      // make API call here

      if (payload.callback_id === 'create_team_dialog') {
        // ask for github repos
        await _postCreateGithubReposPage(req, res);

        // ask for PT boards
        _postCreatePtBoardPage(req, res);
      }
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