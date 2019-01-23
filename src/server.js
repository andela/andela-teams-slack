import 'babel-polyfill' // eslint-disable-line
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

import Messenger from './workers/Messenger';
import SlackObjectResolver from './middleware/SlackObjectResolver';
import Utility from './middleware/Utility';


if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = new express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const messenger = new Messenger();
const resolver = new SlackObjectResolver();
const utils = new Utility();

app.get('/', async (req, res) => {
  res.status(200).send("Hello World!");
});

app.post('/interactions', async (req, res, next) => {
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  res.status(200).send();
  next()
}, messenger.openDialog)

app.post('/slash/teams', utils.postWelcomeMessage, resolver.getUserObjectFromReqBodyUserId, messenger.postLandingPage)

/** 
 * The endpoint is POSTed to when certain events (like a user posted a message)
 * occur.
*/
app.post('/message', async (req, res) => {
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  // if Slack is "challenging" our URL in order to verify it
  if (req.body.challenge) {
    return res.status(200).json({ challenge: req.body.challenge });
  }
})

let server = app.listen(process.env.PORT || 5000, () => {
  let port = server.address().port;
  console.log(`Server started on port ${port}`)
})
