import 'babel-polyfill' // eslint-disable-line
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

import Eventhandler from './core/EventHandler';
import InteractionHandler from './core/InteractionHandler';
import SlashCommandHandler from './core/SlashCommandHandler';
import Utility from './core/Utility';

import models from './models'; ////////////////////////////////////////

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = new express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const handler = new Eventhandler();
const interaction = new InteractionHandler();
const slash = new SlashCommandHandler();
const utils = new Utility();

// app.use(async (req, res, next) => {
//   const allAttributes = await models.Attribute.findAll({
//     include: [
//       { model: models.Skill, as: 'skills' },
//     ]
//   });
//   let groups = allAttributes.map(a => {
//     let group = {};
//     a = a.get();
//     group.id = a.id; // used only for sorting
//     group.label = a.name;
//     group.options = a.skills.map(s => {
//       s = s.get();
//       return {
//         label: s.name,
//         value: s.id
//       }
//     });
//     return group;
//   });
//   groups = groups.sort((a, b) => a.id - b.id);
//   console.log(groups);
//   console.log(groups[0].options)
//   next();
// });

app.get('/', async (req, res) => {
  res.status(200).send("Hello World!\nWelcome to Andela Teams for Slack");
});

app.post('/data/external', async (req, res, next) => {
  const allAttributes = await models.Attribute.findAll({
    include: [
      { model: models.Skill, as: 'skills' },
    ]
  });
  let option_groups = allAttributes.map(a => {
    let group = {};
    a = a.get();
    group.id = a.id; // used only for sorting
    group.label = a.name;
    group.options = a.skills.map(s => {
      s = s.get();
      return {
        label: s.name,
        value: s.id
      }
    });
    return group;
  });
  option_groups = option_groups.sort((a, b) => a.id - b.id);
  return res.status(200).json({ option_groups });
});

app.post('/events', 
  handler.challenge,
  utils.getUserObjectFromReqBodyEventUser,
  utils.rejectUsersWithNoEmailOrGithub,
  handler.addMeReaction,
  utils.handleErrors);

app.post('/interactions',
  utils.postEmptyMessage,
  utils.getUserObjectFromReqBodyPayloadUserId,
  utils.rejectUsersWithNoEmailOrGithub,
  interaction.dialogSubmission,
  interaction.interactiveMessage,
  interaction.messageAction,
  utils.handleErrors);

app.post('/slash/teams',
  utils.postWelcomeMessage,
  utils.getUserObjectFromReqBodyUserId,
  utils.rejectUsersWithNoEmailOrGithub,
  slash.teams,
  utils.handleErrors);

let server = app.listen(process.env.PORT || 5000, () => {
  let port = server.address().port;
  console.log(`Server started on port ${port}`)
})
