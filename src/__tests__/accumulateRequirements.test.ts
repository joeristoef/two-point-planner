import { accumulateRequirements } from '../utils/eventRequirements';
import { Expedition, Event, Skill } from '../types/index';

describe('accumulateRequirements', () => {
  const baseExpedition: Expedition = {
    name: 'Test Expedition',
    map: 'Test Map',
    skillRequirements: [
      { skill: 'Digging' as Skill, level: 2 }
    ],
    staffRequirements: [],
    events: [],
    rewards: []
  };

  const createEvent = (
    overrides: Partial<Event> = {}
  ): Event => ({
    id: 1,
    name: 'Test Event',
    type: 'Positive',
    subtype: '',
    description: 'Test',
    unlockDescription: 'Test',
    counter: {},
    requirements: [],
    ...overrides
  });

  it('should include base skill requirements', () => {
    const result = accumulateRequirements(baseExpedition);
    expect(result.skills).toContainEqual({ name: 'Digging', level: 2 });
  });

  it('should take max level when skill appears in base and event', () => {
    const event = createEvent({
      requirements: [
        { type: 'Skill', name: 'Digging', level: 3 }
      ]
    });

    const expedition = { ...baseExpedition, events: [event] };
    const result = accumulateRequirements(expedition);

    const diggingReq = result.skills.find(s => s.name === 'Digging');
    expect(diggingReq?.level).toBe(3); // Max of 2 (base) and 3 (event)
  });

  it('should collect items from events', () => {
    const event = createEvent({
      requirements: [
        { type: 'Item', name: 'Rope' },
        { type: 'Item', name: 'Lantern' }
      ]
    });

    const expedition = { ...baseExpedition, events: [event] };
    const result = accumulateRequirements(expedition);

    expect(result.items).toEqual([
      { name: 'Lantern' },
      { name: 'Rope' }
    ]);
  });

  it('should collect ranks from events', () => {
    const event = createEvent({
      requirements: [
        { type: 'Rank', name: 'Rank 3', level: 3 }
      ]
    });

    const expedition = { ...baseExpedition, events: [event] };
    const result = accumulateRequirements(expedition);

    expect(result.ranks).toContainEqual({ name: 'Rank 3', level: 3 });
  });

  it('should collect stats from events', () => {
    const event = createEvent({
      requirements: [
        { type: 'Stat', name: 'Strength', level: 4 }
      ]
    });

    const expedition = { ...baseExpedition, events: [event] };
    const result = accumulateRequirements(expedition);

    expect(result.stats).toContainEqual({ name: 'Strength', level: 4 });
  });

  it('should filter by event type', () => {
    const negativeEvent = createEvent({
      type: 'Negative',
      requirements: [
        { type: 'Item', name: 'Bandages' }
      ]
    });

    const positiveEvent = createEvent({
      requirements: [
        { type: 'Item', name: 'Rope' }
      ]
    });

    const expedition = { ...baseExpedition, events: [negativeEvent, positiveEvent] };
    const typeFilter = new Set(['Positive']);
    const result = accumulateRequirements(expedition, typeFilter);

    expect(result.items).toEqual([{ name: 'Rope' }]);
    expect(result.items).not.toContainEqual({ name: 'Bandages' });
  });

  it('should filter by event subtype', () => {
    const injuryEvent = createEvent({
      type: 'Injury',
      subtype: 'Bleeding',
      requirements: [
        { type: 'Item', name: 'Bandages' }
      ]
    });

    const fractureEvent = createEvent({
      type: 'Injury',
      subtype: 'Fracture',
      requirements: [
        { type: 'Item', name: 'Splint' }
      ]
    });

    const expedition = { ...baseExpedition, events: [injuryEvent, fractureEvent] };
    const subtypeFilter = new Set(['Bleeding']);
    const result = accumulateRequirements(expedition, undefined, subtypeFilter);

    expect(result.items).toEqual([{ name: 'Bandages' }]);
    expect(result.items).not.toContainEqual({ name: 'Splint' });
  });

  it('should apply both type and subtype filters together', () => {
    const injuryBleeding = createEvent({
      type: 'Injury',
      subtype: 'Bleeding',
      requirements: [
        { type: 'Item', name: 'Bandages' }
      ]
    });

    const positiveEvent = createEvent({
      requirements: [
        { type: 'Item', name: 'Rope' }
      ]
    });

    const injuryFracture = createEvent({
      type: 'Injury',
      subtype: 'Fracture',
      requirements: [
        { type: 'Item', name: 'Splint' }
      ]
    });

    const expedition = { ...baseExpedition, events: [injuryBleeding, positiveEvent, injuryFracture] };
    const typeFilter = new Set(['Injury']);
    const subtypeFilter = new Set(['Bleeding']);
    const result = accumulateRequirements(expedition, typeFilter, subtypeFilter);

    expect(result.items).toEqual([{ name: 'Bandages' }]);
  });

  it('should deduplicate items', () => {
    const event1 = createEvent({
      requirements: [
        { type: 'Item', name: 'Rope' }
      ]
    });

    const event2 = createEvent({
      requirements: [
        { type: 'Item', name: 'Rope' }
      ]
    });

    const expedition = { ...baseExpedition, events: [event1, event2] };
    const result = accumulateRequirements(expedition);

    expect(result.items.filter(i => i.name === 'Rope')).toHaveLength(1);
  });

  it('should deduplicate ranks', () => {
    const event1 = createEvent({
      requirements: [
        { type: 'Rank', name: 'Rank 3' }
      ]
    });

    const event2 = createEvent({
      requirements: [
        { type: 'Rank', name: 'Rank 3' }
      ]
    });

    const expedition = { ...baseExpedition, events: [event1, event2] };
    const result = accumulateRequirements(expedition);

    expect(result.ranks.filter(r => r.name === 'Rank 3')).toHaveLength(1);
  });

  it('should handle events with no requirements', () => {
    const event = createEvent({
      requirements: []
    });

    const expedition = { ...baseExpedition, events: [event] };
    const result = accumulateRequirements(expedition);

    expect(result.skills).toEqual([{ name: 'Digging', level: 2 }]); // Only base
    expect(result.items).toEqual([]);
    expect(result.ranks).toEqual([]);
    expect(result.stats).toEqual([]);
  });

  it('should return empty arrays when no filters match', () => {
    const event = createEvent({
      requirements: [
        { type: 'Item', name: 'Rope' }
      ]
    });

    const expedition = { ...baseExpedition, events: [event] };
    const typeFilter = new Set(['Negative']); // No Positive events match
    const result = accumulateRequirements(expedition, typeFilter);

    expect(result.items).toEqual([]);
    expect(result.skills).toEqual([{ name: 'Digging', level: 2 }]); // Base always included
  });

  it('should sort skills alphabetically', () => {
    const event = createEvent({
      requirements: [
        { type: 'Skill', name: 'Hunting', level: 2 },
        { type: 'Skill', name: 'Athletics', level: 1 }
      ]
    });

    const expedition = { ...baseExpedition, events: [event] };
    const result = accumulateRequirements(expedition);

    expect(result.skills.map(s => s.name)).toEqual(['Athletics', 'Digging', 'Hunting']);
  });
});
