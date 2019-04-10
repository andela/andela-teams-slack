import 'babel-polyfill' // eslint-disable-line
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

import FeedbackAnalytics from './analytics/FeedbackAnalytics';
import DataHandler from './core/DataHandler';
import InteractionHandler from './core/InteractionHandler';
import SlashCommandHandler from './core/SlashCommandHandler';
import Utility from './core/Utility';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = new express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const data = new DataHandler();
const feedbackAnalytics = new FeedbackAnalytics();
const interaction = new InteractionHandler();
const slash = new SlashCommandHandler();
const utils = new Utility();

app.get('/', async (req, res) => {
  res.status(200).send("Hello World!<br /><br />Welcome to Feedback Bot for Slack.");
});

app.get('/api/analytics/feedback/:token',
  feedbackAnalytics.get);

app.post('/data/external',
  utils.getUserObjectFromReqBodyPayloadUserId,
  data.dialogSuggestions);

app.post('/interactions',
  utils.postEmptyMessage,
  utils.getUserObjectFromReqBodyPayloadUserId,
  utils.rejectUsersWithNoEmailOrGithub,
  interaction.dialogCancellation,
  interaction.dialogSubmission,
  interaction.interactiveMessage,
  interaction.messageAction,
  utils.handleErrors);

app.post('/slash/feedback-bot',
  utils.postWelcomeMessage,
  utils.getUserObjectFromReqBodyUserId,
  utils.rejectUsersWithNoEmailOrGithub,
  slash.feedback,
  utils.handleErrors);

let server = app.listen(process.env.PORT || 5000, () => {
  let port = server.address().port;
  console.log(`Server started on port ${port}`)
})
