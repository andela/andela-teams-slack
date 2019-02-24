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
        created_after: query.startDate,
        created_before: query.endDate
      };
      const items = await pivotal.project.fetchStories(query.projectId, options);
      let records = [];
      if (query.analyticsType === 'kanban_view') {
        records = await _getKanbanView(items);
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
