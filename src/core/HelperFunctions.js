export default class HelperFunctions {
  getCreateGithubRepoDialogJson() {
    return {
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
    };
  }

  getCreatePtProjectDialogJson() {
    return {
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
    };
  }

  getCreateTeamDialogJson() {
    return {
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
          label: 'Project',
          name: 'team_project'
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
