export default class HelperFunctions {
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
          label: 'From',
          name: 'analytics_start_date',
          // hint: 'This should be in the past of the front date',
          data_source: 'external'
        },
        {
          type: 'select',
          label: 'To',
          name: 'analytics_end_date',
          // hint: 'This should be in the future of the back date',
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
    let elements = [];
    if (!feedbackId) {
      elements.push({
        type: 'textarea',
        label: 'Feedback',
        name: 'feedback'
      });
    }
    elements.push({ 
      type: 'select',
      label: 'Target User',
      name: 'feedback_target_user',
      data_source: 'conversations' // 'users'
    });
    elements.push({
      type: 'select',
      label: 'Skill',
      name: 'feedback_skill',
      data_source: 'external'
    });
    elements.push({
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
    });
    elements.push({
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
    });
    elements.push({
      type: 'textarea',
      label: 'Context',
      name: 'feedback_context',
      hint: 'Provide backgroud context to the feedback',
      optional: true
    });
    return {
      callback_id: `record_feedback_dialog:${feedbackId || ''}`,
      title: 'Record Feedback',
      notify_on_cancel: true,
      state: 'record_feedback_dialog',
      elements
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
