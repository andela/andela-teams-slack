import jwt from 'jsonwebtoken';

import HelperFunctions from '../core/HelperFunctions';
import PivotalTracker from '../integrations/PivotalTracker';

const helpers = new HelperFunctions();
const pivotal = new PivotalTracker();

export default class PivotalTrackerAnalytics {
  async get(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      const options = {
        updated_after: query.startDate,
        updated_before: query.endDate
      };
      const items = await pivotal.project.fetchStories(query.projectId, options);
      let records = [];
      if (query.analyticsType === 'kanban_view') {
        records = await _getKanbanView(items);
      } else if (query.analyticsType === 'users_connections') {
        records = await _getUsersConnections(items, query.projectId);
      }
      return res.status(200).json({ records });
    } catch(error) {
      next(error);
    }
  }
}

function _getKanbanView(items) {
  let stateGroupsMap = new Map();
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    if (stateGroupsMap.has(item.current_state)) {
      let stories = Array.from(stateGroupsMap.get(item.current_state));
      stories.push(item);
      stateGroupsMap.set(item.current_state, stories);
    } else {
      stateGroupsMap.set(item.current_state, [item]);
    }
  }
  let records = [];
  for (let [state, stories] of stateGroupsMap) {
    records.push({
      title: helpers.getTitleCase(state),
      count: stories.length,
      percent: (Number(stories.length) / items.length) * 100,
      stories
    });
  }
  return records;
}

async function _getUsersConnections(items, projectId) {console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
  let highestNumOfPairStories = 0;console.log(`items.length: ${items.length}`)
  let records = [];
  let connections = [];
  let userIds = [];
  let teamStories = items.filter(i => i.owner_ids.length > 1);console.log(`teamStories.length: ${teamStories.length}`)
  // function to get cached or fresh user
  let usersCache = new Map();
  let __getUserFromCacheOrPt = async function(userId) {
    if (!usersCache.has(userId)) {
      let member = await pivotal.project.getMember(userId, projectId);
      usersCache.set(userId, { id: member.id, name: member.person.name });
    }
    console.log(`usersCache: ${usersCache}`)
    return usersCache.get(userId);
  };
  // get all user IDs
  teamStories.forEach(s => {
    s.owner_ids.forEach(id => {
      if (!userIds.includes(id)) {
        userIds.push(id);
      }
    });
  });
  console.log(`userIds: ${userIds}`)
  // get all connections
  for (let i = 0; i < userIds.length; i++) {
    for (let j =  (i + 1); j < userIds.length; j++) {
      let pairedStories =
        teamStories.filter(s => s.owner_ids.includes(userIds[i]) && s.owner_ids.includes(userIds[j]))
        .map(s => ({ id: s.id, name: s.name }));
      console.log(`paired stories for ${userIds[i]} and ${userIds[j]}:`)
      console.log(pairedStories);
      highestNumOfPairStories = Math.max(highestNumOfPairStories, pairedStories.length);
      console.log(`highestNumOfPairStories: ${highestNumOfPairStories}`)
      connections.push({
        pairs: [userIds[i], userIds[j]],
        stories: pairedStories
      });
    }
  }
  userIds.forEach(id => {
    let user = await __getUserFromCacheOrPt(id);
    console.log(`user: ${user}`)
    let allPairedIds =
      connections.filter(c => c.pairs.includes(id))
      .map(c => c.pairs[0] !== id ? c.pairs[0] : c.pairs[1]);
    console.log(`allPairedIds: ${allPairedIds}`)
    user.connections = []
    allPairedIds.forEach(pid => {
      let pairedUser = await __getUserFromCacheOrPt(pid);
      console.log(`pairedUser: ${pairedUser}`)
      let pairedConns = connections.filter(c => c.pairs.includes(id) && c.pairs.includes(pid))
      console.log(`pairedConns: ${pairedConns}`)
      let stories = pairedConns.map(c => c.stories);
      console.log(`stories: ${stories}`)
      console.log({
        user: {
            id: pairedUser.id,
            name: pairedUser.name
        },
        stories,
        strength: (stories.length / highestNumOfPairStories) * 100
      });
      user.connections.push({
        user: {
            id: pairedUser.id,
            name: pairedUser.name
        },
        stories,
        strength: (stories.length / highestNumOfPairStories) * 100
      })
    })
    records.push(user);
  });
  return records;
}
