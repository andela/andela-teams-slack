import 'babel-polyfill' // eslint-disable-line
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

import Eventhandler from './core/EventHandler';
import SlackMessenger from './core/SlackMessenger';
import SlashCommandHandler from './core/SlashCommandHandler';
import Utility from './core/Utility';


if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = new express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const handler = new Eventhandler();
const messenger = new SlackMessenger();
const slash = new SlashCommandHandler();
const utils = new Utility();

app.get('/', async (req, res) => {
  res.status(200).send("Hello World!\nWelcome to Andela Teams for Slack");
});

app.post('/events', handler.challenge, utils.getUserObjectFromReqBodyEventUser, handler.addMeReaction, handler.default)

app.post('/interactions', utils.postEmptyMessage, utils.getUserObjectFromReqBodyPayloadUserId, messenger.handleInteractions)

app.post('/slash/teams', utils.postWelcomeMessage, utils.getUserObjectFromReqBodyUserId, slash.teams)

let server = app.listen(process.env.PORT || 5000, () => {
  let port = server.address().port;
  console.log(`Server started on port ${port}`)
})
