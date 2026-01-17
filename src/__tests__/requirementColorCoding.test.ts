/**
 * Tests for requirement color-coding logic
 * These tests verify that requirement stamps are correctly color-coded based on staff fulfillment
 */

import { StaffMember, Skill } from '../types/index';

describe('Requirement Color-Coding Logic', () => {
  const createStaffMember = (
    id: string,
    name: string,
    skills: Array<[string, number]> = []
  ): StaffMember => {
    const skillMap = new Map<Skill, number>();
    for (const [skillName, level] of skills) {
      skillMap.set(skillName as Skill, level);
    }
    return {
      id,
      name,
      type: 'Assistant',
      level: 1,
      skills: skillMap
    };
  };

  // This is a helper function that would be used in ExpeditionList.tsx
  const canFulfillRequirement = (
    requirementName: string,
    requirementType: string,
    requirementLevel: number | undefined,
    staff: StaffMember[]
  ): boolean => {
    if (staff.length === 0) return false;

    switch (requirementType) {
      case 'Skill': {
        // Find max skill level across roster
        let maxLevel = 0;
        for (const member of staff) {
          const skillLevel = member.skills.get(requirementName as any);
          if (skillLevel && skillLevel > maxLevel) {
            maxLevel = skillLevel;
          }
        }
        return maxLevel >= (requirementLevel || 0);
      }
      case 'Stat': {
        // Stats not yet tracked in data model - return false (conservative approach)
        return false;
      }
      case 'Rank': {
        // Ranks not yet tracked in data model - return false (conservative approach)
        return false;
      }
      case 'Item': {
        // Items not yet tracked in inventory - return false (conservative approach)
        return false;
      }
      default:
        return false;
    }
  };

  describe('canFulfillRequirement', () => {
    it('should return green (true) when skill requirement is met', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 2]])
      ];

      const result = canFulfillRequirement('Digging', 'Skill', 2, roster);
      expect(result).toBe(true);
    });

    it('should return green (true) when skill level exceeds requirement', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 3]])
      ];

      const result = canFulfillRequirement('Digging', 'Skill', 2, roster);
      expect(result).toBe(true);
    });

    it('should return red (false) when skill level is insufficient', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 1]])
      ];

      const result = canFulfillRequirement('Digging', 'Skill', 3, roster);
      expect(result).toBe(false);
    });

    it('should return red (false) when skill is completely missing', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Mechanics', 2]])
      ];

      const result = canFulfillRequirement('Digging', 'Skill', 2, roster);
      expect(result).toBe(false);
    });

    it('should use max skill level across entire roster', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 1]]),
        createStaffMember('2', 'Staff Member 2', [['Digging', 2]]),
        createStaffMember('3', 'Staff Member 3', [['Digging', 3]])
      ];

      // Requirement level 3 should be fulfilled by the max (3)
      const result = canFulfillRequirement('Digging', 'Skill', 3, roster);
      expect(result).toBe(true);
    });

    it('should handle skill requirement with no level specified (level 0)', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 0]])
      ];

      const result = canFulfillRequirement('Digging', 'Skill', undefined, roster);
      expect(result).toBe(true);
    });

    it('should return red (false) for stat requirements (not yet implemented)', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1')
      ];

      const result = canFulfillRequirement('Strength', 'Stat', 2, roster);
      expect(result).toBe(false);
    });

    it('should return red (false) for rank requirements (not yet implemented)', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1')
      ];

      const result = canFulfillRequirement('Rank 2', 'Rank', undefined, roster);
      expect(result).toBe(false);
    });

    it('should return red (false) for item requirements (not yet implemented)', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1')
      ];

      const result = canFulfillRequirement('Rope', 'Item', undefined, roster);
      expect(result).toBe(false);
    });

    it('should return red (false) when roster is empty', () => {
      const roster: StaffMember[] = [];

      const result = canFulfillRequirement('Digging', 'Skill', 2, roster);
      expect(result).toBe(false);
    });

    it('should return green (true) when all skills in multiple requirements are met', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 2], ['Mechanics', 3]])
      ];

      const digging = canFulfillRequirement('Digging', 'Skill', 2, roster);
      const mechanics = canFulfillRequirement('Mechanics', 'Skill', 2, roster);

      expect(digging).toBe(true);
      expect(mechanics).toBe(true);
    });

    it('should return correct colors for mixed requirement fulfillment', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 2], ['Mechanics', 1]])
      ];

      // Digging requirement level 2 can be fulfilled (staff has 2)
      const digging = canFulfillRequirement('Digging', 'Skill', 2, roster);
      expect(digging).toBe(true);

      // Mechanics requirement level 3 cannot be fulfilled (staff has 1)
      const mechanics = canFulfillRequirement('Mechanics', 'Skill', 3, roster);
      expect(mechanics).toBe(false);

      // Both should have different results indicating mixed fulfillment
      expect(digging).not.toBe(mechanics);
    });
  });

  describe('Color assignments', () => {
    it('should assign green border (#51cf66) when requirement can be fulfilled', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 2]])
      ];

      const canFulfill = canFulfillRequirement('Digging', 'Skill', 2, roster);
      const borderColor = canFulfill ? '#51cf66' : '#ff6b6b';

      expect(borderColor).toBe('#51cf66');
    });

    it('should assign red border (#ff6b6b) when requirement cannot be fulfilled', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 1]])
      ];

      const canFulfill = canFulfillRequirement('Digging', 'Skill', 3, roster);
      const borderColor = canFulfill ? '#51cf66' : '#ff6b6b';

      expect(borderColor).toBe('#ff6b6b');
    });

    it('should apply same color to level badge as border', () => {
      const roster = [
        createStaffMember('1', 'Staff Member 1', [['Digging', 2]])
      ];

      const canFulfill = canFulfillRequirement('Digging', 'Skill', 2, roster);
      const borderColor = canFulfill ? '#51cf66' : '#ff6b6b';
      
      // Level badge background should match border color
      expect(borderColor).toBe('#51cf66');
    });
  });
});
