import request from 'request-promise-native';

import Github from '../integrations/Github';
import Helpers from './HelperFunctions';
import PivotalTracker from '../integrations/PivotalTracker';

const github = new Github();
const helpers = new Helpers();
const pivotal = new PivotalTracker();

async function _handleCreateGithubRepoDialog(req, res) {
  try {
    let submission = req.payload.submission;
    var repoName = submission.repo_name;
    repoName = helpers.getUrlFriendlyName(repoName);
  
    req.repoName = repoName;
    req.repoDescription = submission.repo_desc || '';
    req.repoIsPrivate = submission.repo_visibility === 'private';
    _createAndPostGithubRepoLink(req, res);
  } catch (err) {
    console.log(err);
    // TODO: post an ephemeral message to the user (get info from req.payload)
  }
}

async function _handleCreatePtProjectDialog(req, res) {
  try {
    let submission = req.payload.submission;
    var projectName = submission.project_name;
    // projectName = helpers.getUrlFriendlyName(projectName);
  
    req.projectName = projectName;
    req.projectDescription = submission.project_desc || '';
    req.projectIsPrivate = submission.project_visibility === 'private';
    _createAndPostPtProjectLink(req, res);
  } catch (err) {
    console.log(err);
    // TODO: post an ephemeral message to the user (get info from req.payload)
  }
}

async function _openDialogForCreateGithubRepo(req, res) {
  let url = 'https://slack.com/api/dialog.open';
  await request({
    url: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    formData: {
      token: process.env.SLACK_USER_TOKEN,
      trigger_id: req.payload.trigger_id,
      dialog: JSON.stringify({
        callback_id: 'create_github_repo_dialog',
        title: 'Create Github Repo',
        submit_label: 'Create',
        state: 'create_github_repo_dialog',
        elements: [
          {
            type: 'text',
            label: 'Repo Name',
            name: 'repo_name'
          },
          {
            type: 'text',
            label: 'Description',
            name: 'repo_desc',
            optional: true
          },
          {
            type: 'select',
            label: 'Repo Visibility',
            name: 'repo_visibility',
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
}

async function _openDialogForCreatePtProject(req, res) {
  let url = 'https://slack.com/api/dialog.open';
  await request({
    url: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    formData: {
      token: process.env.SLACK_USER_TOKEN,
      trigger_id: req.payload.trigger_id,
      dialog: JSON.stringify({
        callback_id: 'create_pt_project_dialog',
        title: 'Create PT Project',
        submit_label: 'Create',
        state: 'create_pt_project_dialog',
        elements: [
          {
            type: 'text',
            label: 'Project Name',
            name: 'project_name'
          },
          {
            type: 'text',
            label: 'Description',
            name: 'project_desc',
            optional: true
          },
          {
            type: 'select',
            label: 'Project Visibility',
            name: 'project_visibility',
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
}

async function _openDialogForCreateTeam(req, res) {
  let url = 'https://slack.com/api/dialog.open';
  await request({
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
}

async function _postCreateGithubReposPage(req, res) {
  try {
    let submission = req.payload.submission;
    var teamName = submission.team_name;
    teamName = helpers.getUrlFriendlyName(teamName);
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
          color: 'warning',
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
        attachments: [{
          callback_id: 'create_github_repo',
          color: 'warning',
          fallback: 'Could not perform operation.',
          actions: actions.slice(3)
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
  } catch (err) {
    console.log(err);
    // TODO: post an ephemeral message to the user (get info from req.payload)
  }
}

async function _postCreatePtBoardPage(req, res) {
  try {
    let submission = req.payload.submission;
    var teamName = submission.team_name;
    teamName = helpers.getUrlFriendlyName(teamName);
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
          color: 'warning',
          fallback: 'Could not perform operation.',
          actions: actions
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
  } catch(err) {
    console.log(err);
    // TODO: post an ephemeral message to the user (get info from req.payload)
  }
}

async function _createAndPostGithubRepoLink(req, res) {
  try {
    let result = await github.repo.create(req.repoName, {
      description: req.repoDescription || '',
      organization: process.env.GITHUB_ORGANIZATION,
      private: req.repoIsPrivate || false,
      type: 'org',
      user: {
        githubUsername: req.user.github_user_name
      }
    });

    let text = result.ok ? 'Github repo created' : 'Could not create Github repo';
    let linkOrError = result.ok ? result.url : result.error;
    // let linkOrError = result.ok
    //   ? (result.invitedUser.ok
    //       ? result.url
    //       : result.url + '\n\nAlthough the repo was created you were not added. This could be because you\'ve already been added to the repo before now.')
    //   : result.error;
  
    await request({
      url: req.payload.response_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        text: text,
        attachments: [{
          color: result.ok ? 'good' : 'danger',
          text: linkOrError
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
  } catch(err) {
    console.log(err);
  }
}

async function _createAndPostPtProjectLink(req, res) {
  try {
    let result = await pivotal.project.create(req.projectName, {
      accountId: process.env.PIVOTAL_TRACKER_ACCOUNT_ID,
      description: req.projectDescription || '',
      private: req.projectIsPrivate || false,
      user: {
        email: req.user.email
      }
    });

    let text = result.ok ? 'Pivotal Tracker project created' : 'Could not create Pivotal Tracker project';
    // let linkOrError = result.ok ? result.url : result.error;
    let linkOrError = result.ok
      ? (result.invitedUser.ok
          ? result.url
          : result.url + '\n\nAlthough the project was created you were not added. This could be because you\'ve already been added to the project before now.')
      : result.error;
  
    await request({
      url: req.payload.response_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        text: text,
        attachments: [{
          color: result.ok ? 'good' : 'danger',
          text: linkOrError
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
  } catch(err) {
    console.log(err);
  }
}

async function _postNoEmailError(req, res) {
  try {
    await request({
      url: req.payload.response_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        text: 'Your email address cannot be found on Slack',
        attachments: [{
          color: 'danger',
          text: `Ensure there is a value for the *Email* field on your Slack profile`,
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
  } catch (err) {
    console.log(err);
  }
}

async function _postNoGithubUsernameError(req, res) {
  try {
    await request({
      url: req.payload.response_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        text: 'Your Github profile cannot be found on Slack',
        attachments: [{
          color: 'danger',
          text: `Ensure there is a value for the *Github* field on your Slack profile`,
        }]
      },
      json: true,
      resolveWithFullResponse: true
    });
  } catch (err) {
    console.log(err);
  }
}

export default class SlackMessenger {
  async handleInteractions(req, res){
    let payload = req.payload;
    if (payload.type === 'interactive_message') {
      const value = payload.actions[0].value;
      if (value === 'create_team') {
        _openDialogForCreateTeam(req, res);
      } else if (value.startsWith('create_github_repo:')) {
        if (req.user.github_user_name) {
          let repoName = value.substring(19);
          if (repoName === '?') {
            _openDialogForCreateGithubRepo(req, res);
          } else {
            req.repoName = repoName;
            _createAndPostGithubRepoLink(req, res);
          }
        } else {
          _postNoGithubUsernameError(req, res);
        }
      } else if (value.startsWith('create_pt_project:')) {
        if (req.user.email) {
          let projectName = value.substring(18);
          if (projectName === '?') {
            _openDialogForCreatePtProject(req, res);
          } else {
            req.projectName = projectName;
            _createAndPostPtProjectLink(req, res);
          }
        } else {
          _postNoEmailError(req, res);
        }
      }
    } else if (payload.type === 'dialog_submission') {
      if (payload.callback_id === 'create_github_repo_dialog') {
        await _handleCreateGithubRepoDialog(req, res);
      } else if (payload.callback_id === 'create_pt_project_dialog') {
        await _handleCreatePtProjectDialog(req, res);
      } else if (payload.callback_id === 'create_team_dialog') {
        // TODO: make API call to actually create team

        await _postCreateGithubReposPage(req, res);

        await _postCreatePtBoardPage(req, res);
      }
    }
  }
}