import Slack from '../integrations/Slack';

const slack = new Slack();

export default class SlashCommandHandler {
  async feedback(req, res, next) {
    try {
      var actions = [];
      if (req.user && req.user.is_sims_facilitator) {
        actions.push({
          name: 'landing_page_menu',
          text: 'Record Feedback...',
          style: 'primary',
          type: 'button',
          value: 'record_full_feedback'
        });
        actions.push({
          name: 'landing_page_menu',
          text: 'Analytics...',
          type: 'button',
          value: 'analytics'
        });
      }
      actions.push({
        name: 'landing_page_menu',
        text: 'Help',
        type: 'button',
        url: 'https://github.com/andela-stuff/andela-teams-slack/wiki'
      });
      const attachments = [{
        callback_id: 'landing_page_menu',
        color: 'warning',
        fallback: 'Could not perform operation.',
        actions: actions
      }];

      await slack.chat.postResponse(null, req.body.response_url, attachments);
    } catch (error) {
      next(error);
    }
  }
}
