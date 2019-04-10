import jwt from 'jsonwebtoken';

import HelperFunctions from './HelperFunctions';
import models from '../models';
import Slack from '../integrations/Slack';

const helpers = new HelperFunctions();
const slack = new Slack();

export default class InteractionHandler {
  async dialogCancellation(req, res, next) {
    try {
      let payload = req.payload;
      if (payload.type === 'dialog_cancellation') {
        if (payload.callback_id.startsWith('record_feedback_dialog:')) {
          await _handleRecordFeedbackDialogCancellation(req);
        }
        return;
      }
      next();
    } catch(error) {
      next(error);
    }
  }
  async dialogSubmission(req, res, next) {
    try {
      let payload = req.payload;
      if (payload.type === 'dialog_submission') {
        if (payload.callback_id === 'feedback_analytics_dialog') {
          await _handleFeedbackAnalyticsDialog(req);
        } else if (payload.callback_id.startsWith('record_feedback_dialog:')) {
          await _handleRecordFeedbackDialog(req);
        }
        return;
      }
      next();
    } catch(error) {
      next(error);
    }
  }
  async interactiveMessage(req, res, next) {
    try {
      let payload = req.payload;
      if (payload.type === 'interactive_message') {
        const value = payload.actions[0].value;
        if (value === 'analytics') {
          await slack.dialog.open(payload.trigger_id, helpers.getFeedbackAnalyticsDialogJson());
        } else if (value === 'record_full_feedback') {
          await slack.dialog.open(payload.trigger_id, helpers.getRecordFeedbackDialogJson());
        } 
        return;
      }
      next();
    } catch(error) {
      next(error);
    }
  }
  async messageAction(req, res, next) {
    try {
      let payload = req.payload;
      if (payload.type === 'message_action') {
        if (payload.callback_id === 'record_feedback') {
          if (req.user && req.user.is_sims_facilitator) {
            const feedback = await models.FeedbackInstance.create({
              from: payload.user.id,
              message: payload.message.text
            });
            let response =
              await slack.dialog.open(payload.trigger_id, helpers.getRecordFeedbackDialogJson(feedback.id));
            if (!response.ok) {
              await slack.chat.postEphemeralOrDM(
                'This action cannot be performed at the moment. Try again later.',
                payload.channel.id,
                payload.user.id);
              await feedback.destroy();
            }
          } else {
            await slack.chat.postEphemeralOrDM(
              'This action can only be performed by Learning Facilitators',
              payload.channel.id,
              payload.user.id);
          }
        }
        return;
      }
      next();
    } catch(error) {
      next(error);
    }
  }
}

async function _handleRecordFeedbackDialog(req) {
  let submission = req.payload.submission;
  let targetUsers = [];
  let feedbackId = req.payload.callback_id.substring(23);
  if (!feedbackId) {
    const feedback = await models.FeedbackInstance.create({
      from: req.payload.user.id,
      message: submission.feedback
    });
    feedbackId = feedback.id;
  }
  let sendToUser = submission.feedback_to_user === 'true';
  if (submission.feedback_target_user.startsWith('U')) { // user ID
    targetUsers.push(submission.feedback_target_user);
  } else if (submission.feedback_target_user.startsWith('C') // channel ID
    || submission.feedback_target_user.startsWith('G')) { // private channel or multi-DM ID
    targetUsers = await slack.resolver.getChannelMembers(submission.feedback_target_user);
  }
  // remove the current user from the list of target users
  let filteredUsers = 
    targetUsers.filter(userId => userId != req.payload.user.id); // I'm deliberately using != instead of !==
  let feedbackWithSkill, attachments = [];
  let feedback = await models.FeedbackInstance.findOne({
    where: { id: feedbackId }
  });
  let feedbackObj = feedback.get();
  delete feedbackObj.id;
  delete feedbackObj.skill;
  delete feedbackObj.to;
  // delete feedbackObj.createdAt;
  // delete feedbackObj.updatedAt;
  for (let i = 0; i < filteredUsers.length; i++) {
    // for the first ID we simply update the feedback in the DB
    if (i === 0) {
      await models.FeedbackInstance.update({
        context: submission.feedback_context || undefined,
        skillId: parseInt(submission.feedback_skill, 10) || undefined,
        to: filteredUsers[i],
        type: submission.feedback_type || 'negative'
      }, {
        where: { id: feedbackId }
      });
      if (sendToUser) {
        feedbackWithSkill = await models.FeedbackInstance.findOne({
          where: { id: feedbackId },
          include: [{
            model: models.Skill,
            as: 'skill',
            attributes: ['name'],
            include: [{
              model: models.Attribute,
              as: 'attribute',
              attributes: ['name'],
            }]
          }]
        });
        attachments.push({
          title: 'Feedback',
          text: feedbackWithSkill.message,
          color: feedbackWithSkill.type === 'positive' ? 'good' : 'danger'
        });
        if (feedbackWithSkill.context) {
          attachments.push({
            title: 'Context',
            text: feedbackWithSkill.context,
            color: 'warning'
          });
        }
        if (feedbackWithSkill.skill) {
          attachments.push({
            title: 'Skill',
            text: feedbackWithSkill.skill.name,
            color: 'warning'
          });
          if (feedbackWithSkill.skill.attribute) {
            attachments.push({
              title: 'Attribute',
              text: feedbackWithSkill.skill.attribute.name,
              color: 'warning'
            });
          }
        }
      }
    }
    // for the rest we create new feedback instances
    else {
      // no need to await the promise
      models.FeedbackInstance.create({ ...feedbackObj, to: filteredUsers[i] });
    }

    // send feedback as DM (no need to await the promise)
    if (sendToUser) {
      slack.chat.postDM(
        `Hi <@${filteredUsers[i]}>, you have a recorded piece of feedback from <@${req.payload.user.id}>`,
        filteredUsers[i],
        attachments);
    }
  }

  slack.chat.postEphemeralOrDM(
    'Feedback recorded!',
    req.payload.channel.id,
    req.payload.user.id);
  // send email
}

async function _handleFeedbackAnalyticsDialog(req) {
  //let returnUrl = `https://${req.get('host')}/ui/analytics/feedback`;
  let returnUrl = `https://andela-teams.herokuapp.com`;
  let submission = req.payload.submission;
  let to, type;
  if (submission.feedback_target_user) {
    to = [];
    if (submission.feedback_target_user.startsWith('U')) { // user ID
      to.push(submission.feedback_target_user);
    } else if (submission.feedback_target_user.startsWith('C') // channel ID
      || submission.feedback_target_user.startsWith('G')) { // private channel or multi-DM ID
      to = await slack.resolver.getChannelMembers(submission.feedback_target_user);
    }
  }
  if (submission.feedback_type) {
    type = submission.feedback_type;
  }
  let query = {
    where: {
      to,
      type,
      createdAt: { 
        $gte: new Date(submission.analytics_start_date),
        $lte: new Date(submission.analytics_end_date)
      }
    },
    analyticsType: submission.analytics_type
  };
  if (submission.analytics_type === 'feedback_table') {
    returnUrl += '/table';
  } else if (submission.analytics_type === 'feedback_time_distribution') {
    returnUrl += '/distribution';
  } else if (submission.analytics_type === 'attributes_chart') {
    returnUrl += '/attributes';
  } else if (submission.analytics_type === 'skills_chart') {
    returnUrl += '/skills';
  }
  const token = jwt.sign(query, process.env.JWT_SECRET);
  returnUrl += `/${token}`;
  await slack.chat.postEphemeralOrDM(
    returnUrl,
    req.payload.channel.id,
    req.payload.user.id);
}

async function _handleRecordFeedbackDialogCancellation(req) {
  let feedbackId = req.payload.callback_id.substring(23);
  if (feedbackId) {
    const feedback = await models.FeedbackInstance.findOne({
      where: { id: feedbackId }
    });
    if (feedback) {
      await feedback.destroy();
    }
  }
}
