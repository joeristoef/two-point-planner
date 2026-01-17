import { Expedition, Event, AccumulatedRequirements } from '../types/index';

/**
 * Accumulates requirements from an expedition's base requirements and filtered events.
 * 
 * @param expedition - The expedition to accumulate requirements from
 * @param filterByEventTypes - Set of event types to include (if empty, includes all)
 * @param filterByEventSubtypes - Set of event subtypes to include (if empty, includes all)
 * @returns AccumulatedRequirements containing all requirements from base + filtered events
 */
export function accumulateRequirements(
  expedition: Expedition,
  filterByEventTypes?: Set<string>,
  filterByEventSubtypes?: Set<string>
): AccumulatedRequirements {
  const result: AccumulatedRequirements = {
    skills: [],
    items: [],
    ranks: [],
    stats: []
  };

  // Map to track maximum level for each skill/stat (using name as key)
  const skillLevels = new Map<string, number>();
  const statLevels = new Map<string, number>();
  const rankLevels = new Map<string, number>();
  const itemSet = new Set<string>();

  // Always include base skill requirements
  for (const skillReq of expedition.skillRequirements) {
    skillLevels.set(skillReq.skill, skillReq.level);
  }

  // Filter and process events
  const filteredEvents = filterEvents(
    expedition.events,
    filterByEventTypes,
    filterByEventSubtypes
  );

  // Extract requirements from filtered events
  for (const event of filteredEvents) {
    if (event.requirements && event.requirements.length > 0) {
      for (const req of event.requirements) {
        if (req.type === 'Skill') {
          const currentLevel = skillLevels.get(req.name) ?? 0;
          skillLevels.set(req.name, Math.max(currentLevel, req.level ?? 0));
        } else if (req.type === 'Stat') {
          const currentLevel = statLevels.get(req.name) ?? 0;
          statLevels.set(req.name, Math.max(currentLevel, req.level ?? 0));
        } else if (req.type === 'Rank') {
          const currentLevel = rankLevels.get(req.name) ?? 0;
          rankLevels.set(req.name, Math.max(currentLevel, req.level ?? 0));
        } else if (req.type === 'Item') {
          itemSet.add(req.name);
        }
      }
    }
  }

  // Convert maps/sets to array format
  result.skills = Array.from(skillLevels.entries())
    .map(([name, level]) => ({ name, level }))
    .sort((a, b) => a.name.localeCompare(b.name));

  result.stats = Array.from(statLevels.entries())
    .map(([name, level]) => ({ name, level }))
    .sort((a, b) => a.name.localeCompare(b.name));

  result.ranks = Array.from(rankLevels.entries())
    .map(([name, level]) => ({ name, level }))
    .sort((a, b) => a.name.localeCompare(b.name));

  result.items = Array.from(itemSet)
    .map(name => ({ name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

/**
 * Filters expedition events by type and/or subtype.
 * If filters are empty or undefined, all events are included.
 */
function filterEvents(
  events: Event[],
  filterByEventTypes?: Set<string>,
  filterByEventSubtypes?: Set<string>
): Event[] {
  if (!filterByEventTypes && !filterByEventSubtypes) {
    return events;
  }

  return events.filter(event => {
    // If type filter exists and event type not in filter, exclude
    if (filterByEventTypes && filterByEventTypes.size > 0) {
      if (!filterByEventTypes.has(event.type)) {
        return false;
      }
    }

    // If subtype filter exists and event subtype not in filter, exclude
    if (filterByEventSubtypes && filterByEventSubtypes.size > 0) {
      if (event.subtype && !filterByEventSubtypes.has(event.subtype)) {
        return false;
      }
    }

    return true;
  });
}

