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

  getFeedbackAnalyticsDialogJson() {
    return {
      callback_id: 'feedback_analytics_dialog',
      title: 'Feedback Analytics',
      state: 'feedback_analytics_dialog',
      elements: [
        { 
          type: 'select',
          label: 'Feedback Recipient',
          name: 'feedback_target_user',
          data_source: 'conversations'
        },
        {
          type: 'select',
          label: 'Type',
          name: 'feedback_type',
          value: 'negative',
          options: [{
            label: '😊', // \u263A
            value: 'positive'
          }, {
            label: '\u2639', // 😞
            value: 'negative'
          }]
        },
        {
          type: 'select',
          label: 'Back Date',
          name: 'feedback_start_date',
          hint: 'This should be in the past of the front date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Front Date',
          name: 'feedback_end_date',
          hint: 'This should be in the future of the back date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Analytics Type',
          name: 'feedback_analytics_type',
          value: 'feedback_table',
          options: [{
            label: 'Table of feedback instances',
            value: 'feedback_table'
          }, {
            label: 'Distribution of feedback instances over time',
            value: 'feedback_time_distribution'
          }, {
            label: 'Attributes chart',
            value: 'attributes_chart'
          }, {
            label: 'Skills chart',
            value: 'skills_chart'
          }]
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
          label: 'Type',
          name: 'feedback_type',
          value: 'negative',
          options: [{
            label: '😊', // \u263A
            value: 'positive'
          }, {
            label: '\u2639', // 😞
            value: 'negative'
          }]
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
