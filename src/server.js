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

app.post('/events', async (req, res) => {
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  // if Slack is "challenging" our URL in order to verify it
  if (req.body.challenge) {
    return res.status(200).json({ challenge: req.body.challenge });
  } else {
    let event = req.body.event;
    // the user id is event.user
    if (event.type === 'reaction_added' && event.reaction === 'add_me') {
      console.log('Add me to this:')
      if (event.item.type === 'message') {
        // get the message (which should be a URL)
        let messageText = await resolver.getMessageFromChannel(event.item.ts, event.item.channel);
        console.log(messageText);
        // TODO: check if messageText is a link <...>
        // TODO: make API call
      }
    } else if (event.type === 'reaction_removed' && event.reaction === 'add_me') {
      console.log('Remove me from this:')
      let messageText = await resolver.getMessageFromChannel(event.item.ts, event.item.channel);
      console.log(messageText);
    }
    return res.status(200).send();
  }
})

app.post('/interactions', utils.postEmptyMessage, messenger.openDialog)

app.post('/slash/teams', utils.postWelcomeMessage, resolver.getUserObjectFromReqBodyUserId, messenger.postLandingPage)

let server = app.listen(process.env.PORT || 5000, () => {
  let port = server.address().port;
  console.log(`Server started on port ${port}`)
})
