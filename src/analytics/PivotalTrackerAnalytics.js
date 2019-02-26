import jwt from 'jsonwebtoken';

import HelperFunctions from '../core/HelperFunctions';
import PivotalTracker from '../integrations/PivotalTracker';

const helpers = new HelperFunctions();
const pivotal = new PivotalTracker();

let usersCache = new Map();

export default class PivotalTrackerAnalytics {
  async get(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);console.log(query)
      const options = {
        updated_after: query.startDate,
        updated_before: query.endDate
      };
      const items = await pivotal.project.fetchStories(query.projectId, options);
      let records = [];
      if (query.analyticsType === 'kanban_view') {
        records = await _getKanbanView(items);
      } else if (query.analyticsType === 'users_collaborations') {
        records = await _getUsersCollaborations(items, query.projectId);
      } else if (query.analyticsType === 'users_skills_hits') {
        records = await _getUsersSkillsHits(items, query.projectId);
      }
      return res.status(200).json({ records });
    } catch(error) {console.log(error)
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

async function _getUsersCollaborations(items, projectId) {
  let highestNumOfPairStories = 0;
  let records = [];
  let collaborations = [];
  let userIds = [];
  let teamStories = items.filter(i => i.owner_ids.length > 1);

  // get all user IDs
  teamStories.forEach(s => {
    s.owner_ids.forEach(id => {
      if (!userIds.includes(id)) {
        userIds.push(id);
      }
    });
  });
  // get all collaborations
  for (let i = 0; i < userIds.length; i++) {
    for (let j =  (i + 1); j < userIds.length; j++) {
      let pairedStories =
        teamStories.filter(s => s.owner_ids.includes(userIds[i]) && s.owner_ids.includes(userIds[j]))
        .map(s => ({ id: s.id, name: s.name, url: s.url }));
      highestNumOfPairStories = Math.max(highestNumOfPairStories, pairedStories.length);
      if (pairedStories.length > 0) {
        collaborations.push({
          pairs: [userIds[i], userIds[j]],
          stories: pairedStories
        });
      }
    }
  }
  // create user objects and their collaborations
  for (let i = 0; i < userIds.length; i++) {
    let id = userIds[i];
    let user = await __getUserFromCacheOrPt(id, projectId);
    let allPairedIds =
      collaborations.filter(c => c.pairs.includes(id))
      .map(c => c.pairs[0] !== id ? c.pairs[0] : c.pairs[1]);
    user.collaborations = []
    for(let j = 0; j < allPairedIds.length; j++) {
      let pid = allPairedIds[j];
      let pairedUser = await __getUserFromCacheOrPt(pid, projectId);
      let pairedConns = collaborations.filter(c => c.pairs.includes(id) && c.pairs.includes(pid))
      // let stories = pairedConns.map(c => c.stories);
      let stories = [];
      pairedConns.forEach(c => {
        stories = stories.concat(c.stories);
      });
      console.log('>>>>>>>>>>>>>>>>>>>')
      console.log({
        user: {
            id: pairedUser.id,
            name: pairedUser.name,
            membershipId: pairedUser.membershipId
        },
        //stories,
        numberOfStories: stories.length,
        strength: (stories.length / highestNumOfPairStories) * 100
      })
      user.collaborations.push({
        user: {
            id: pairedUser.id,
            name: pairedUser.name,
            membershipId: pairedUser.membershipId
        },
        //stories,
        numberOfStories: stories.length,
        strength: (stories.length / highestNumOfPairStories) * 100
      })
    }
    records.push(user);
  }
  return records;
}

async function _getUsersSkillsHits(items, projectId) {
  let records = [];
  let hits = [];
  let userIds = [];
  let filteredStories =
    items.filter(
      i => i.owner_ids.length > 0
      && i.labels.length > 0
      && (i.current_state === 'started'
          || i.current_state === 'finished'
          || i.current_state === 'delivered'
          || i.current_state === 'accepted'));

  // get all user IDs
  filteredStories.forEach(s => {
    s.owner_ids.forEach(id => {
      if (!userIds.includes(id)) {
        userIds.push(id);
      }
    });
  });
  // get all hits
  for (let i = 0; i < userIds.length; i++) {
    filteredStories.filter(s => s.owner_ids.includes(userIds[i]))
      .forEach(s => {
        s.labels.forEach(l => {
          hits.push({
            userId: userIds[i],
            name: l.name,
            state: s.current_state
          });
        });
      });
  }
  // create user objects and their skills
  for (let i = 0; i < userIds.length; i++) {
    let id = userIds[i];
    let hitsMap = new Map();
    let user = await __getUserFromCacheOrPt(id, projectId);
    user.skills = []
    hits.forEach(h => {
      if (hitsMap.has(h.name)) {
        let hit = hitsMap.get(h.name);
        hit.doneHits = Number(hit.doneHits) + Number(h.state === 'accepted' ? 1 : 0);
        hit.ongoingHits = Number(hit.ongoingHits) + Number(h.state !== 'accepted' ? 1 : 0);
        hitsMap.set(h.name, hit);
      } else {
        hitsMap.set(h.name, {
          name: h.name,
          doneHits: h.state === 'accepted' ? 1 : 0,
          ongoingHits: h.state !== 'accepted' ? 1 : 0
        });
      }
    });
    for (let [name, hit] of hitsMap) {
      user.skills.push(hit);
    }
    records.push(user);
  }
  return records;
}

async function __getUserFromCacheOrPt(userId, projectId) {
  if (!usersCache.has(userId)) {
    let member = await pivotal.project.getMember(userId, projectId);
    usersCache.set(userId, { id: member.person.id, name: member.person.name, membershipId: member.id });
  }
  return usersCache.get(userId);
};
