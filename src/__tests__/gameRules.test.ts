/**
 * Tests for gameRules.ts
 * 
 * Validates:
 * - Skill restrictions (what skills each staff type can learn)
 * - Slot calculation (5 skill slots max, levels use slots)
 * - Utility scores for skills
 */

import {
  SKILL_RESTRICTIONS,
  STAFF_SYSTEM,
  canHaveSkill,
  isExpert,
  getMaxSkillSlots,
  getMaxSkillLevel,
  calculateUsedSkillSlots,
  calculateRemainingSkillSlots,
  getAvailableSkills,
  getSkillUtility,
} from '../config/gameRules';

describe('gameRules.ts - Skill Restrictions', () => {
  describe('Skill Restrictions by Staff Type', () => {
    it('should allow General Staff only universal skills', () => {
      const generalStaffSkills = SKILL_RESTRICTIONS['General Staff'];
      
      // Universal skills should be allowed
      expect(generalStaffSkills.has('Aerodynamics')).toBe(true);
      expect(generalStaffSkills.has('Happy Thoughts')).toBe(true);
      expect(generalStaffSkills.has('Pilot Wings')).toBe(true);
      
      // Expert-only skills should NOT be allowed
      expect(generalStaffSkills.has('Analysis')).toBe(false);
      expect(generalStaffSkills.has('Survey Skills')).toBe(false);
    });

    it('should allow Marine Life Expert to have Fish Whispering', () => {
      const marineSkills = SKILL_RESTRICTIONS['Marine Life Expert'];
      expect(marineSkills.has('Fish Whispering')).toBe(true);
    });

    it('should NOT allow Marine Life Expert to have Button Master', () => {
      const marineSkills = SKILL_RESTRICTIONS['Marine Life Expert'];
      expect(marineSkills.has('Button Master')).toBe(false);
    });

    it('should allow Marine Life Expert to have expert-only skills', () => {
      const marineSkills = SKILL_RESTRICTIONS['Marine Life Expert'];
      expect(marineSkills.has('Survival Skills')).toBe(true);
      expect(marineSkills.has('Survey Skills')).toBe(true);
    });

    it('should allow Janitor Fire-Resistance but not Button Master', () => {
      const janitorSkills = SKILL_RESTRICTIONS['Janitor'];
      expect(janitorSkills.has('Fire-Resistance')).toBe(true);
      expect(janitorSkills.has('Ghost Capture')).toBe(true);
      expect(janitorSkills.has('Button Master')).toBe(false);
    });

    it('should allow Security Guard universal skills but not type-exclusive other skills', () => {
      const securitySkills = SKILL_RESTRICTIONS['Security Guard'];
      expect(securitySkills.has('Aerodynamics')).toBe(true);
      expect(securitySkills.has('Camera Room')).toBe(true);
      expect(securitySkills.has('Fish Whispering')).toBe(false);
    });
  });

  describe('canHaveSkill() function', () => {
    it('should return true for allowed skills', () => {
      expect(canHaveSkill('Marine Life Expert', 'Fish Whispering')).toBe(true);
      expect(canHaveSkill('General Staff', 'Pilot Wings')).toBe(true);
    });

    it('should return false for disallowed skills', () => {
      expect(canHaveSkill('Marine Life Expert', 'Button Master')).toBe(false);
      expect(canHaveSkill('General Staff', 'Fish Whispering')).toBe(false);
    });
  });

  describe('isExpert() function', () => {
    it('should identify expert staff types', () => {
      expect(isExpert('Prehistory Expert')).toBe(true);
      expect(isExpert('Marine Life Expert')).toBe(true);
      expect(isExpert('Fantasy Expert')).toBe(true);
    });

    it('should not identify non-experts as experts', () => {
      expect(isExpert('General Staff')).toBe(false);
      expect(isExpert('Janitor')).toBe(false);
      expect(isExpert('Security Guard')).toBe(false);
      expect(isExpert('Assistant')).toBe(false);
    });
  });
});

describe('gameRules.ts - Slot System', () => {
  describe('Slot Constants', () => {
    it('should define max slots as 5', () => {
      expect(STAFF_SYSTEM.maxSlots).toBe(5);
    });

    it('should define max skill level as 3', () => {
      expect(STAFF_SYSTEM.maxSkillLevel).toBe(3);
    });

    it('should return correct max slots via function', () => {
      expect(getMaxSkillSlots()).toBe(5);
    });

    it('should return correct max skill level via function', () => {
      expect(getMaxSkillLevel()).toBe(3);
    });
  });

  describe('calculateUsedSkillSlots() function', () => {
    it('should calculate 0 slots for empty skills', () => {
      const emptySkills = new Map<string, number>();
      expect(calculateUsedSkillSlots(emptySkills as any)).toBe(0);
    });

    it('should calculate 1 slot for a level-1 skill', () => {
      const skills = new Map<string, number>([['Pilot Wings', 1]]);
      expect(calculateUsedSkillSlots(skills as any)).toBe(1);
    });

    it('should calculate 2 slots for a level-2 skill', () => {
      const skills = new Map<string, number>([['Fish Whispering', 2]]);
      expect(calculateUsedSkillSlots(skills as any)).toBe(2);
    });

    it('should calculate 5 slots for the Darkest Depths case', () => {
      // Marine Life Expert MUST have exactly these 3 skills
      const darkestDepthsSkills = new Map<string, number>([
        ['Fish Whispering', 2],       // 2 slots
        ['Survival Skills', 2],        // 2 slots
        ['Survey Skills', 1],          // 1 slot
      ]);
      expect(calculateUsedSkillSlots(darkestDepthsSkills as any)).toBe(5);
    });

    it('should calculate 5 slots for multiple different-level skills', () => {
      const skills = new Map<string, number>([
        ['Pilot Wings', 2],            // 2 slots
        ['Aerodynamics', 1],           // 1 slot
        ['Happy Thoughts', 2],         // 2 slots
      ]);
      expect(calculateUsedSkillSlots(skills as any)).toBe(5);
    });
  });

  describe('calculateRemainingSkillSlots() function', () => {
    it('should return 5 slots for empty skills', () => {
      const emptySkills = new Map<string, number>();
      expect(calculateRemainingSkillSlots(emptySkills as any)).toBe(5);
    });

    it('should return 4 slots when 1 slot is used', () => {
      const skills = new Map<string, number>([['Pilot Wings', 1]]);
      expect(calculateRemainingSkillSlots(skills as any)).toBe(4);
    });

    it('should return 0 slots when all 5 are used (Darkest Depths case)', () => {
      const darkestDepthsSkills = new Map<string, number>([
        ['Fish Whispering', 2],
        ['Survival Skills', 2],
        ['Survey Skills', 1],
      ]);
      expect(calculateRemainingSkillSlots(darkestDepthsSkills as any)).toBe(0);
    });

    it('should return negative in edge case (should not happen in real game)', () => {
      // This tests the boundary, though in real game we'd prevent this
      const overfilledSkills = new Map<string, number>([
        ['Pilot Wings', 3],
        ['Aerodynamics', 3],
      ]);
      expect(calculateRemainingSkillSlots(overfilledSkills as any)).toBe(-1);
    });
  });
});

describe('gameRules.ts - Skill Utility', () => {
  it('should define utility for Aerodynamics as 8', () => {
    expect(getSkillUtility('Aerodynamics')).toBe(8);
  });

  it('should define utility for Pilot Wings as 7', () => {
    expect(getSkillUtility('Pilot Wings')).toBe(7);
  });

  it('should define utility for Happy Thoughts as 3', () => {
    expect(getSkillUtility('Happy Thoughts')).toBe(3);
  });

  it('should return 0 for skills with no utility defined', () => {
    expect(getSkillUtility('Fish Whispering')).toBe(0);
  });
});

describe('gameRules.ts - getAvailableSkills() function', () => {
  it('should return universal skills for General Staff', () => {
    const available = getAvailableSkills('General Staff');
    expect(available).toContain('Aerodynamics');
    expect(available).toContain('Pilot Wings');
    expect(available).toContain('Happy Thoughts');
    expect(available.length).toBeLessThan(10);
  });

  it('should return universal + expert skills for Marine Life Expert', () => {
    const available = getAvailableSkills('Marine Life Expert');
    expect(available).toContain('Aerodynamics');
    expect(available).toContain('Fish Whispering');
    expect(available).toContain('Survival Skills');
    expect(available.length).toBeGreaterThan(6);
  });
});
