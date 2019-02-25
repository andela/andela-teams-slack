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

async function _getUsersConnections(items, projectId) {
  let highestNumOfPairStories = 0;
  let records = [];
  let connections = [];
  let userIds = [];
  let teamStories = items.filter(i => i.owner_ids.length > 1);
  // function to get cached or fresh user
  let usersCache = new Map();
  let __getUserFromCacheOrPt = async function(userId) {
    if (!usersCache.has(userId)) {
      let member = await pivotal.project.getMember(userId, projectId);
      usersCache.set(userId, { id: member.person.id, name: member.person.name, membershipId: member.id });
    }
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
  // get all connections
  for (let i = 0; i < userIds.length; i++) {
    for (let j =  (i + 1); j < userIds.length; j++) {
      let pairedStories =
        teamStories.filter(s => s.owner_ids.includes(userIds[i]) && s.owner_ids.includes(userIds[j]))
        .map(s => ({ id: s.id, name: s.name }));
      highestNumOfPairStories = Math.max(highestNumOfPairStories, pairedStories.length);
      if (pairedStories.length > 0) {
        connections.push({
          pairs: [userIds[i], userIds[j]],
          stories: pairedStories
        });
      }
    }
  }
  for (let i = 0; i < userIds.length; i++) {
    let id = userIds[i];
    let user = await __getUserFromCacheOrPt(id);
    let allPairedIds =
      connections.filter(c => c.pairs.includes(id))
      .map(c => c.pairs[0] !== id ? c.pairs[0] : c.pairs[1]);
    user.connections = []
    for(let j = 0; j < allPairedIds.length; j++) {
      let pid = allPairedIds[j];
      let pairedUser = await __getUserFromCacheOrPt(pid);
      let pairedConns = connections.filter(c => c.pairs.includes(id) && c.pairs.includes(pid))
      // let stories = pairedConns.map(c => c.stories);
      let stories = [];
      pairedConns.forEach(c => {
        stories = stories.concat(c.stories);
      });
      user.connections.push({
        user: {
            id: pairedUser.id,
            name: pairedUser.name,
            membershipId: pairedUser.membershipId
        },
        stories,
        strength: (stories.length / highestNumOfPairStories) * 100
      })
    }
    records.push(user);
  }
  return records;
}
