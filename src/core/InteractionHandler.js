import request from 'request-promise-native';

import Github from '../integrations/Github';
import HelperFunctions from './HelperFunctions';
import PivotalTracker from '../integrations/PivotalTracker';
import Slack from '../integrations/Slack';

const github = new Github();
const helpers = new HelperFunctions();
const pivotal = new PivotalTracker();
const slack = new Slack();

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
  
    // to use await slack.chat.postEphemeral
    // replace arg req.payload.response_url
    // with req.payload.channel.id, req.payload.user.id
    await slack.chat.postResponse(
      text,
      req.payload.response_url,
      [{
        color: result.ok ? 'good' : 'danger',
        text: linkOrError,
      }]);
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
  
    await slack.chat.postResponse(
      text,
      req.payload.response_url,
      [{
        color: result.ok ? 'good' : 'danger',
        text: linkOrError,
      }]);
  } catch(err) {
    console.log(err);
  }
}

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

async function _postCreateGithubReposPage(req, res) {
  try {
    let submission = req.payload.submission;
    var teamName = submission.team_name;
    teamName = helpers.getUrlFriendlyName(teamName);
    var teamProject = submission.team_project || 'Authors Haven';
    teamProject = helpers.getInitials(teamProject);
    let suggestedNames = helpers.githubConventions(teamName, teamProject);
  
    var actions = [];
    var i = 0;
    for (i = 0; i <= suggestedNames.length; i++) {
      actions.push({
        name: 'create_github_repo',
        text: suggestedNames[i],
        type: 'button',
        value: `create_github_repo:${suggestedNames[i]}`
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
    await slack.chat.postResponse(
      'Click buttons to create Github repos',
      req.payload.response_url,
      [{
        callback_id: 'create_github_repo',
        color: 'warning',
        fallback: 'Could not perform operation.',
        // text: '',
        // title: '',
        // title_link: '',
        actions: actions.slice(0, 3)
      }]);
    await slack.chat.postResponse(
      null,
      req.payload.response_url,
      [{
        callback_id: 'create_github_repo',
        color: 'warning',
        fallback: 'Could not perform operation.',
        actions: actions.slice(3)
      }]);
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
    let suggestedNames = helpers.ptConventions(teamName, teamProject);
  
    var actions = [];
    var i = 0;
    for (i = 0; i <= suggestedNames.length; i++) {
      actions.push({
        name: 'create_pt_project',
        text: suggestedNames[i],
        type: 'button',
        value: `create_pt_project:${suggestedNames[i]}`
      });
    }
    actions.push({
      name: 'create_pt_project',
      text: 'Custom...',
      style: 'primary',
      type: 'button',
      value: 'create_pt_project:?'
    });
  
    await slack.chat.postResponse(
      'Click buttons to create Pivotal Tracker projects',
      req.payload.response_url,
      [{
        callback_id: 'create_pt_project',
        color: 'warning',
        fallback: 'Could not perform operation.',
        actions: actions
      }]);
  } catch(err) {
    console.log(err);
    // TODO: post an ephemeral message to the user (get info from req.payload)
  }
}

export default class InteractionHandler {
  async dialogSubmission(req, res, next){
    let payload = req.payload;
    if (payload.type === 'dialog_submission') {
      if (payload.callback_id === 'create_github_repo_dialog') {
        await _handleCreateGithubRepoDialog(req, res);
      } else if (payload.callback_id === 'create_pt_project_dialog') {
        await _handleCreatePtProjectDialog(req, res);
      } else if (payload.callback_id === 'create_team_dialog') {
        // TODO: make API call to actually create team

        await _postCreateGithubReposPage(req, res);

        await _postCreatePtBoardPage(req, res);
      }

      return;
    }

    next();
  }
  async interactiveMessage(req, res, next){
    let payload = req.payload;
    if (payload.type === 'interactive_message') {
      const value = payload.actions[0].value;
      if (value === 'create_team') {
        await slack.dialog.open(req.payload.trigger_id, helpers.getCreateTeamDialogJson());
      } else if (value.startsWith('create_github_repo:')) {
        let repoName = value.substring(19);
        if (repoName === '?') {
          await slack.dialog.open(req.payload.trigger_id, helpers.getCreateGithubRepoDialogJson());
        } else {
          req.repoName = repoName;
          _createAndPostGithubRepoLink(req, res);
        }
      } else if (value.startsWith('create_pt_project:')) {
        let projectName = value.substring(18);
        if (projectName === '?') {
          await slack.dialog.open(req.payload.trigger_id, helpers.getCreatePtProjectDialogJson());
        } else {
          req.projectName = projectName;
          _createAndPostPtProjectLink(req, res);
        }
      }

      return;
    }

    next();
  }
  async default(req, res) {}
}