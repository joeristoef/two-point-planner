/**
 * Tests for Slot System - Edge Cases
 * 
 * The slot system is critical because forced compositions (like Darkest Depths)
 * depend on accurate slot calculation. This test file focuses on edge cases
 * and the specific Darkest Depths example from PROJECT_CONTEXT.
 */

import { calculateUsedSkillSlots, calculateRemainingSkillSlots, STAFF_SYSTEM } from '../config/gameRules';

describe('Slot System - Edge Cases & Darkest Depths', () => {
  describe('The Darkest Depths Edge Case', () => {
    it('should correctly identify that Marine Life Expert is completely locked (5/5 slots)', () => {
      // This is the real Darkest Depths requirement for Marine Life Expert:
      // - Fish Whispering L2 (exclusive, 2 slots)
      // - Survival Skills L2 (exclusive, 2 slots)
      // - Survey Skills L1 (exclusive, 1 slot)
      // = 5/5 slots COMPLETELY LOCKED
      
      const darkestDepthsMarineExpert = new Map<string, number>([
        ['Fish Whispering', 2],
        ['Survival Skills', 2],
        ['Survey Skills', 1],
      ]);

      const usedSlots = calculateUsedSkillSlots(darkestDepthsMarineExpert as any);
      const remainingSlots = calculateRemainingSkillSlots(darkestDepthsMarineExpert as any);

      expect(usedSlots).toBe(5);
      expect(remainingSlots).toBe(0);
      
      // This means: ZERO flexibility for this staff type on this expedition
      expect(STAFF_SYSTEM.maxSlots - usedSlots).toBe(0);
    });

    it('should correctly identify that Security Guard has flexibility (2/5 slots used)', () => {
      // Darkest Depths Security Guard requirement:
      // - Pilot Wings L2 (2 slots)
      // = 2/5 slots (flexible, 3 free)
      
      const darkestDepthsSecurityGuard = new Map<string, number>([
        ['Pilot Wings', 2],
      ]);

      const usedSlots = calculateUsedSkillSlots(darkestDepthsSecurityGuard as any);
      const remainingSlots = calculateRemainingSkillSlots(darkestDepthsSecurityGuard as any);

      expect(usedSlots).toBe(2);
      expect(remainingSlots).toBe(3);
    });
  });

  describe('Slot boundary conditions', () => {
    it('should handle 0 slots used correctly', () => {
      const empty = new Map<string, number>();
      expect(calculateUsedSkillSlots(empty as any)).toBe(0);
      expect(calculateRemainingSkillSlots(empty as any)).toBe(5);
    });

    it('should handle exactly 1 slot', () => {
      const oneSlot = new Map<string, number>([['Pilot Wings', 1]]);
      expect(calculateUsedSkillSlots(oneSlot as any)).toBe(1);
      expect(calculateRemainingSkillSlots(oneSlot as any)).toBe(4);
    });

    it('should handle exactly 5 slots', () => {
      const fullSlots = new Map<string, number>([['Pilot Wings', 3], ['Aerodynamics', 2]]);
      expect(calculateUsedSkillSlots(fullSlots as any)).toBe(5);
      expect(calculateRemainingSkillSlots(fullSlots as any)).toBe(0);
    });

    it('should handle multiple skills with different levels', () => {
      const multiSkill = new Map<string, number>([
        ['Pilot Wings', 3],       // 3 slots
        ['Aerodynamics', 1],      // 1 slot
        ['Happy Thoughts', 1],    // 1 slot
      ]);
      expect(calculateUsedSkillSlots(multiSkill as any)).toBe(5);
      expect(calculateRemainingSkillSlots(multiSkill as any)).toBe(0);
    });

    it('should handle max level skills (3 levels = 3 slots)', () => {
      const maxLevel = new Map<string, number>([
        ['Pilot Wings', 3],       // max level = 3 slots
      ]);
      expect(calculateUsedSkillSlots(maxLevel as any)).toBe(3);
      expect(calculateRemainingSkillSlots(maxLevel as any)).toBe(2);
    });
  });

  describe('Realistic staff configurations', () => {
    it('should calculate slots for lightly trained staff (1-2 skills)', () => {
      const lightlyTrained = new Map<string, number>([
        ['Pilot Wings', 1],
        ['Aerodynamics', 1],
      ]);
      expect(calculateUsedSkillSlots(lightlyTrained as any)).toBe(2);
      expect(calculateRemainingSkillSlots(lightlyTrained as any)).toBe(3);
    });

    it('should calculate slots for moderately trained staff (3-4 skills)', () => {
      const moderatelyTrained = new Map<string, number>([
        ['Pilot Wings', 2],
        ['Aerodynamics', 1],
        ['Happy Thoughts', 1],
      ]);
      expect(calculateUsedSkillSlots(moderatelyTrained as any)).toBe(4);
      expect(calculateRemainingSkillSlots(moderatelyTrained as any)).toBe(1);
    });

    it('should calculate slots for fully trained staff (exactly 5 slots)', () => {
      const fullyTrained = new Map<string, number>([
        ['Pilot Wings', 2],
        ['Aerodynamics', 2],
        ['Happy Thoughts', 1],
      ]);
      expect(calculateUsedSkillSlots(fullyTrained as any)).toBe(5);
      expect(calculateRemainingSkillSlots(fullyTrained as any)).toBe(0);
    });
  });

  describe('Staff system constants', () => {
    it('should enforce 5 slots per staff member', () => {
      expect(STAFF_SYSTEM.maxSlots).toBe(5);
    });

    it('should enforce level 3 as max skill level', () => {
      expect(STAFF_SYSTEM.maxSkillLevel).toBe(3);
    });

    it('should ensure max slots math is correct (5 = max slots)', () => {
      const fullSlots = new Map<string, number>([
        ['Pilot Wings', 3],
        ['Aerodynamics', 2],
      ]);
      const used = calculateUsedSkillSlots(fullSlots as any);
      expect(used).toBe(STAFF_SYSTEM.maxSlots);
    });
  });
});
