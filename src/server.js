import 'babel-polyfill' // eslint-disable-line
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

import SlackMessenger from './workers/SlackMessenger';
import SlackObjectResolver from './workers/SlackObjectResolver';
import Utility from './middleware/Utility';


if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = new express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const messenger = new SlackMessenger();
const resolver = new SlackObjectResolver();
const utils = new Utility();

app.get('/', async (req, res) => {
  res.status(200).send("Hello World!");
});

app.post('/events', async (req, res) => {
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  // if Slack is "challenging" our URL in order to verify it
  if (req.body.challenge) {
    return res.status(200).json({ challenge: req.body.challenge });
  } else {
    let event = req.body.event;
    if (event.type === 'reaction_added' && event.reaction === 'add_me') {
      console.log('Add me to this:')
      if (event.item.type === 'message') {
        let messageText = await resolver.getMessageFromChannel(event.item.ts, event.item.channel);
        console.log(messageText);
        // TODO: check if messageText is a link <...>
        // TODO: make API call (the user id is event.user)
      }
    } else if (event.type === 'reaction_removed' && event.reaction === 'add_me') {
      console.log('Remove me from this:')
      let messageText = await resolver.getMessageFromChannel(event.item.ts, event.item.channel);
      console.log(messageText);
    }
    return res.status(200).send();
  }
})

app.post('/interactions', utils.postEmptyMessage, utils.getUserObjectFromReqPayloadUser, messenger.handleInteractions)

app.post('/slash/teams', utils.postWelcomeMessage, utils.getUserObjectFromReqBodyUserId, messenger.postLandingPage)

let server = app.listen(process.env.PORT || 5000, () => {
  let port = server.address().port;
  console.log(`Server started on port ${port}`)
})
