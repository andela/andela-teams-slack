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
          optional: true,
          data_source: 'conversations'
        },
        {
          type: 'select',
          label: 'Type',
          name: 'feedback_type',
          // value: 'negative',
          optional: true,
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
          name: 'analytics_start_date',
          hint: 'This should be in the past of the front date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Front Date',
          name: 'analytics_end_date',
          hint: 'This should be in the future of the back date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Analytics Type',
          name: 'analytics_type',
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
          data_source: 'conversations' // 'users'
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
          type: 'select',
          label: 'Send feedback to target user?',
          name: 'feedback_to_user',
          value: 'true',
          options: [{
            label: 'Yes',
            value: 'true'
          }, {
            label: 'No',
            value: 'false'
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

  getPtAnalyticsDialogJson() {
    return {
      callback_id: 'pt_analytics_dialog',
      title: 'PT Analytics',
      state: 'pt_analytics_dialog',
      elements: [
        {
          type: 'text',
          label: 'PT Project URL',
          name: 'project_url',
          placeholder: 'https://www.pivotaltracker.com/n/projects/1234567',
          subtype: 'url'
        },
        {
          type: 'select',
          label: 'Back Date',
          name: 'analytics_start_date',
          hint: 'This should be in the past of the front date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Front Date',
          name: 'analytics_end_date',
          hint: 'This should be in the future of the back date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'Analytics Type',
          name: 'analytics_type',
          value: 'users_vs_skills',
          options: [{
            label: 'Users and the skills they have touched',
            value: 'users_vs_skills'
          }, {
            label: 'Skills and the users that touched them',
            value: 'skills_vs_users'
          },{
            label: 'Users and the stories they have touched',
            value: 'users_vs_stories'
          }, {
            label: 'Stories and the users that touched them',
            value: 'stories_vs_users'
          }, {
            label: 'Kanban view',
            value: 'kanban_view'
          }, {
            label: 'Users\' collaborations',
            value: 'users_collaborations'
          }]
        }
      ]
    };
  }

  getUrlFriendlyName(word) {
    return word.replace(/\s/g, '-').toLowerCase();
  }

  getInitials(word) {
    // b=positon w=matches any word g=repeat the word through all string
    let removeCase = word.replace(/[^a-zA-Z0-9 ]/g, "");
    let matches = removeCase.match(/\b(\w)/g);
    return matches.join('').toLowerCase();
  }

  getTitleCase(sentence) {
    let splitStr = sentence.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
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
