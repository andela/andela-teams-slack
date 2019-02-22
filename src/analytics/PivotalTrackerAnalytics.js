import jwt from 'jsonwebtoken';

import models from '../models';
import PivotalTracker from '../integrations/PivotalTracker';
import Slack from '../integrations/Slack';

const pivotal = new PivotalTracker();
const slack = new Slack();

export default class PivotalTrackerAnalytics {
  async get(req, res, next) {
    try {
      let token = req.params.token;
      const query = jwt.verify(token, process.env.JWT_SECRET);
      const items = await pivotal.project.fetchStories(query.projectId, {}); // TODO: start and end dates
      let records = [];
      if (query.analyticsType === 'kanban_view') {
        records = items;
        // records = await _getKanbanView(items);
      }
      return res.status(200).json({ records });
    } catch(error) {
      next(error);
    }
  }
}

function _getKanbanView(items) {
  let attriGroupsMap = new Map();
  let totalCount = 0;
  for (let i = 0; i < items.length; i++) {
    let item = items[i].get();
    if (!item.skill) {
      continue;
    }
    item.skill = item.skill.get();
    if (!item.skill.attribute) {
      continue;
    }
    item.skill.attribute = item.skill.attribute.get();
    if (attriGroupsMap.has(item.skill.attribute.name)) {
      attriGroupsMap.set(
        item.skill.attribute.name,
        Number(attriGroupsMap.get(item.skill.attribute.name)) + 1);
    } else {
      attriGroupsMap.set(item.skill.attribute.name, 1);
    }
    totalCount += 1;
  }
  let records = [];
  for (let [attribute, count] of attriGroupsMap) {
    records.push({
      attribute,
      count,
      percent: (Number(count) / totalCount) * 100
    });
  }
  return records;
}
