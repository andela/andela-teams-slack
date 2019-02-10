export default class HelperFunctions {
  getCreateGithubRepoDialogJson() {
    return {
      callback_id: 'create_github_repo_dialog',
      title: 'Create Github Repo',
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
    };
  }

  getCreatePtProjectDialogJson() {
    return {
      callback_id: 'create_pt_project_dialog',
      title: 'Create PT Project',
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
    };
  }

  getCreateTeamDialogJson() {
    return {
      callback_id: 'create_team_dialog',
      title: 'Create Team',
      state: 'create_team_dialog',
      elements: [
        {
          type: 'text',
          label: 'Team Name',
          name: 'team_name'
        },
        {
          type: 'text',
          label: 'Project',
          name: 'team_project'
        }
      ]
    };
  }

  getRecordFeedbackDialogJson(feedbackId) {
    return {
      callback_id: `record_feedback_dialog:${feedbackId}`,
      title: 'Record Feedback',
      notify_on_cancel: true,
      state: 'record_feedback_dialog',
      elements: [
        { 
          type: 'select',
          label: 'Target User',
          name: 'feedback_target_user',
          data_source: 'users'
        },
        {
          type: 'select',
          label: 'Skill',
          name: 'feedback_skill',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Send Feedback',
          name: 'feedback_to_user',
          optional: true,
          value: 'no',
          options: [{
            label: 'No',
            value: 'no'
          }, {
            label: 'Send as DM',
            value: 'dm'
          }, {
            label: 'Send as Email',
            value: 'email'
          }, {
            label: 'Send as DM and Email',
            value: 'dm_and_email'
          }]
        },
        {
          type: 'text',
          label: 'CC',
          name: 'feedback_email_cc',
          hint: 'If you choose to send feedback as email to user, supply comma-separated list of emails to CC',
          optional: true,
          placeholder: 'tdd-ops@andela.com, tdd-d0-ops@andela.com'
        },
        {
          type: 'textarea',
          label: 'Context',
          name: 'feedback_context',
          hint: 'Provide backgroud context to the feedback',
          optional: true
        }
      ]
    };
  }

  getUrlFriendlyName(word) {
    return word.replace(/\s/g, '-').toLowerCase();
  }

  getInitials(word) {
    // b=positon w=matches any word g=repeat the word through all string
    let matches = word.match(/\b(\w)/g);
    return matches.join('').toLowerCase();
  }

  githubConventions(teamName, projectName = 'ah') {
    return [
      `${teamName}-${projectName}`, `${teamName}-${projectName}-backend`, `${projectName}-${teamName}-backend`,
      `${projectName}-${teamName}`, `${teamName}-${projectName}-frontend`, `${projectName}-${teamName}-frontend`,
    ];
  }

  ptConventions(teamName, projectName = 'ah') {
    return [
      `${teamName}`,
      `${teamName}-${projectName}`,
      `${projectName}-${teamName}`
    ];
  }
}
