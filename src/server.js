import 'babel-polyfill' // eslint-disable-line
import express from 'express';
import bodyParser from 'body-parser';

import Messenger from './workers/Messenger';

const app = new express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const messenger = new Messenger();

app.get('/', async (req, res) => {
  res.status(200).send("Hello World!");
});

app.post('/slash/teams', async (req, res) => {
  // console.log(req.body);
  messenger.postWelcomeMessage(req, res);
  messenger.postLandingPage(req, res);
})

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
