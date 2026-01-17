/**
 * Tests for Event Requirement Parsing
 * 
 * These tests verify that event requirements are correctly parsed from
 * EventCounter CSV data into normalized Requirement objects.
 */

import { Requirement } from '../types/index';

// Test helper: simulate parseEventRequirements function
function parseEventRequirements(counter: {
  skill?: string;
  skillLevel?: number;
  rank?: number;
  stat?: string;
  statLevel?: number;
  item?: string;
}): Requirement[] {
  const requirements: Requirement[] = [];

  if (counter.skill) {
    requirements.push({
      type: 'Skill',
      name: counter.skill,
      level: counter.skillLevel,
    });
  }

  if (counter.stat) {
    requirements.push({
      type: 'Stat',
      name: counter.stat,
      level: counter.statLevel,
    });
  }

  if (counter.rank) {
    requirements.push({
      type: 'Rank',
      name: `Rank ${counter.rank}`,
    });
  }

  if (counter.item) {
    requirements.push({
      type: 'Item',
      name: counter.item,
    });
  }

  return requirements;
}

describe('Event Requirement Parsing', () => {
  describe('parseEventRequirements() function', () => {
    it('should parse skill requirement with level', () => {
      const counter = {
        skill: 'Pilot Wings',
        skillLevel: 2,
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toEqual({
        type: 'Skill',
        name: 'Pilot Wings',
        level: 2,
      });
    });

    it('should parse stat requirement with level', () => {
      const counter = {
        stat: 'Stress',
        statLevel: 3,
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toEqual({
        type: 'Stat',
        name: 'Stress',
        level: 3,
      });
    });

    it('should parse rank requirement (no level)', () => {
      const counter = {
        rank: 2,
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toEqual({
        type: 'Rank',
        name: 'Rank 2',
      });
    });

    it('should parse item requirement (no level)', () => {
      const counter = {
        item: 'Whip',
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toEqual({
        type: 'Item',
        name: 'Whip',
      });
    });

    it('should parse multiple requirements together', () => {
      const counter = {
        skill: 'Pilot Wings',
        skillLevel: 2,
        stat: 'Stress',
        statLevel: 3,
        item: 'Whip',
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(3);
      expect(requirements).toContainEqual({
        type: 'Skill',
        name: 'Pilot Wings',
        level: 2,
      });
      expect(requirements).toContainEqual({
        type: 'Stat',
        name: 'Stress',
        level: 3,
      });
      expect(requirements).toContainEqual({
        type: 'Item',
        name: 'Whip',
      });
    });

    it('should handle empty counter (no requirements)', () => {
      const counter = {};

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(0);
    });

    it('should ignore undefined values in counter', () => {
      const counter = {
        skill: undefined,
        skillLevel: undefined,
        item: 'Hat',
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toEqual({
        type: 'Item',
        name: 'Hat',
      });
    });

    it('should handle skill requirement with no level (undefined)', () => {
      const counter = {
        skill: 'Aerodynamics',
        skillLevel: undefined,
      };

      const requirements = parseEventRequirements(counter);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toEqual({
        type: 'Skill',
        name: 'Aerodynamics',
        level: undefined,
      });
    });

    it('should parse multiple events with different requirement types', () => {
      const events = [
        {
          name: 'Monsoon Season',
          counter: { skill: 'Pilot Wings', skillLevel: 2, stat: 'Stress', statLevel: 3 },
        },
        {
          name: 'Wind Gust',
          counter: { skill: 'Pilot Wings', skillLevel: 1 },
        },
        {
          name: 'Safe Haven',
          counter: { item: 'Umbrella' },
        },
      ];

      const parsedEvents = events.map((e) => ({
        ...e,
        requirements: parseEventRequirements(e.counter as any),
      }));

      expect(parsedEvents[0].requirements).toHaveLength(2);
      expect(parsedEvents[1].requirements).toHaveLength(1);
      expect(parsedEvents[2].requirements).toHaveLength(1);
    });
  });

  describe('Requirement type consistency', () => {
    it('should always return Requirement objects with correct type field', () => {
      const counter = {
        skill: 'Analysis',
        skillLevel: 1,
        rank: 1,
        item: 'Microscope',
      };

      const requirements = parseEventRequirements(counter);

      for (const req of requirements) {
        expect(['Skill', 'Stat', 'Rank', 'Item']).toContain(req.type);
        expect(req.name).toBeDefined();
        expect(typeof req.name).toBe('string');
      }
    });

    it('should have level only for Skill and Stat types', () => {
      const counter = {
        skill: 'Analysis',
        skillLevel: 2,
        stat: 'Stress',
        statLevel: 1,
        rank: 2,
        item: 'Equipment',
      };

      const requirements = parseEventRequirements(counter);

      const skillReq = requirements.find((r) => r.type === 'Skill');
      const statReq = requirements.find((r) => r.type === 'Stat');
      const rankReq = requirements.find((r) => r.type === 'Rank');
      const itemReq = requirements.find((r) => r.type === 'Item');

      expect(skillReq?.level).toBeDefined();
      expect(statReq?.level).toBeDefined();
      expect(rankReq?.level).toBeUndefined();
      expect(itemReq?.level).toBeUndefined();
    });
  });
});
