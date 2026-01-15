/**
 * Tests for expeditionMatcher.ts
 * 
 * This is critical because matching determines which expeditions are feasible.
 * Tests include:
 * - Darkest Depths (forced composition edge case)
 * - Simple expeditions (easy cases)
 * - Complex combinations
 */

import { canFulfillExpedition, checkAllExpeditions } from '../utils/expeditionMatcher';
import { Expedition, StaffMember } from '../types/index';

// Helper to create staff members for testing
function createStaff(
  name: string,
  type: 'Marine Life Expert' | 'Security Guard' | 'Janitor' | 'Prehistory Expert' | 'Assistant'
): StaffMember {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    type,
    skills: new Map(),
  };
}

// Helper to add skill to staff
function addSkill(
  staff: StaffMember,
  skillName: string,
  level: number
): StaffMember {
  staff.skills.set(skillName as any, level);
  return staff;
}

describe('expeditionMatcher.ts - Basic Matching', () => {
  it('should mark expedition as IMPOSSIBLE with no staff', () => {
    const noStaff: StaffMember[] = [];
    const simpleExpedition: Expedition = {
      name: 'Test Expedition',
      map: 'Test Map',
      skillRequirements: [{ skill: 'Pilot Wings' as any, level: 1 }],
      staffRequirements: [],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition(noStaff, simpleExpedition);
    expect(result.status).not.toBe('possible');
  });

  it('should mark expedition as POSSIBLE when requirements are met', () => {
    const staff = [
      addSkill(createStaff('Guard 1', 'Security Guard'), 'Pilot Wings', 1),
    ];
    
    const simpleExpedition: Expedition = {
      name: 'Simple Expedition',
      map: 'Test Map',
      skillRequirements: [{ skill: 'Pilot Wings' as any, level: 1 }],
      staffRequirements: [{ type: 'Security Guard', count: 1 }],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition(staff, simpleExpedition);
    expect(result.status).toBe('possible');
    expect(result.missingSkills.length).toBe(0);
    expect(result.missingStaff.length).toBe(0);
  });

  it('should mark expedition as PARTIAL when staff type is missing but skills exist somewhere', () => {
    const staff = [
      addSkill(createStaff('Expert 1', 'Prehistory Expert'), 'Pilot Wings', 1),
    ];
    
    const expedition: Expedition = {
      name: 'Test Expedition',
      map: 'Test Map',
      skillRequirements: [{ skill: 'Pilot Wings' as any, level: 1 }],
      staffRequirements: [{ type: 'Security Guard', count: 1 }],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition(staff, expedition);
    expect(result.status).toBe('partial');
    expect(result.missingStaff.length).toBeGreaterThan(0);
  });
});

describe('expeditionMatcher.ts - Darkest Depths Edge Case', () => {
  // Darkest Depths is the critical test case from PROJECT_CONTEXT
  // It has a forced composition where Marine Life Expert uses ALL 5 slots
  
  it('should mark Darkest Depths as POSSIBLE with correctly trained staff', () => {
    const marineExpert = createStaff('Marine 1', 'Marine Life Expert');
    addSkill(marineExpert, 'Fish Whispering', 2);      // 2 slots
    addSkill(marineExpert, 'Survival Skills', 2);      // 2 slots
    addSkill(marineExpert, 'Survey Skills', 1);        // 1 slot
    // = 5/5 slots LOCKED

    const securityGuard = createStaff('Guard 1', 'Security Guard');
    addSkill(securityGuard, 'Pilot Wings', 2);         // 2 slots, 3 free

    const darkestDepths: Expedition = {
      name: 'Darkest Depths',
      map: 'Test Map',
      skillRequirements: [
        { skill: 'Pilot Wings' as any, level: 2 },
        { skill: 'Fish Whispering' as any, level: 2 },
        { skill: 'Survival Skills' as any, level: 2 },
        { skill: 'Survey Skills' as any, level: 1 },
      ],
      staffRequirements: [
        { type: 'Marine Life Expert', count: 1 },
        { type: 'Security Guard', count: 1 },
      ],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition([marineExpert, securityGuard], darkestDepths);
    expect(result.status).toBe('possible');
  });

  it('should mark Darkest Depths as IMPOSSIBLE if Marine Expert is missing any skill', () => {
    const marineExpert = createStaff('Marine 1', 'Marine Life Expert');
    addSkill(marineExpert, 'Fish Whispering', 2);
    addSkill(marineExpert, 'Survival Skills', 2);
    // Missing: Survey Skills L1

    const securityGuard = createStaff('Guard 1', 'Security Guard');
    addSkill(securityGuard, 'Pilot Wings', 2);

    const darkestDepths: Expedition = {
      name: 'Darkest Depths',
      map: 'Test Map',
      skillRequirements: [
        { skill: 'Pilot Wings' as any, level: 2 },
        { skill: 'Fish Whispering' as any, level: 2 },
        { skill: 'Survival Skills' as any, level: 2 },
        { skill: 'Survey Skills' as any, level: 1 },
      ],
      staffRequirements: [
        { type: 'Marine Life Expert', count: 1 },
        { type: 'Security Guard', count: 1 },
      ],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition([marineExpert, securityGuard], darkestDepths);
    expect(result.status).not.toBe('possible');
    expect(result.missingSkills).toContain('Survey Skills (level 1)');
  });

  it('should work with ANY Expert in place of specific expert', () => {
    const marineExpert = createStaff('Marine 1', 'Marine Life Expert');
    addSkill(marineExpert, 'Fish Whispering', 2);
    addSkill(marineExpert, 'Survival Skills', 2);
    addSkill(marineExpert, 'Survey Skills', 1);

    const securityGuard = createStaff('Guard 1', 'Security Guard');
    addSkill(securityGuard, 'Pilot Wings', 2);

    const expeditionWithAnyExpert: Expedition = {
      name: 'Test Expedition',
      map: 'Test Map',
      skillRequirements: [
        { skill: 'Pilot Wings' as any, level: 2 },
        { skill: 'Fish Whispering' as any, level: 2 },
        { skill: 'Survival Skills' as any, level: 2 },
        { skill: 'Survey Skills' as any, level: 1 },
      ],
      staffRequirements: [
        { type: 'ANY Expert', count: 1 },     // ANY Expert instead of Marine Life Expert
        { type: 'Security Guard', count: 1 },
      ],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition([marineExpert, securityGuard], expeditionWithAnyExpert);
    expect(result.status).toBe('possible');
  });

  it('should work with ANY Staff in place of specific type', () => {
    const janitor = createStaff('Janitor 1', 'Janitor');
    addSkill(janitor, 'Pilot Wings', 2);

    const expeditionWithAnyStaff: Expedition = {
      name: 'Test Expedition',
      map: 'Test Map',
      skillRequirements: [
        { skill: 'Pilot Wings' as any, level: 2 },
      ],
      staffRequirements: [
        { type: 'ANY Staff', count: 1 },     // ANY Staff accepts any type
      ],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition([janitor], expeditionWithAnyStaff);
    expect(result.status).toBe('possible');
  });
});

describe('expeditionMatcher.ts - checkAllExpeditions()', () => {
  it('should evaluate multiple expeditions correctly', () => {
    const staff = [
      addSkill(createStaff('Guard 1', 'Security Guard'), 'Pilot Wings', 1),
    ];

    const expeditions: Expedition[] = [
      {
        name: 'Expedition 1',
        map: 'Map 1',
        skillRequirements: [{ skill: 'Pilot Wings' as any, level: 1 }],
        staffRequirements: [{ type: 'Security Guard', count: 1 }],
        events: [],
        rewards: [],
      },
      {
        name: 'Expedition 2',
        map: 'Map 2',
        skillRequirements: [{ skill: 'Aerodynamics' as any, level: 1 }],
        staffRequirements: [{ type: 'Security Guard', count: 1 }],
        events: [],
        rewards: [],
      },
    ];

    const results = checkAllExpeditions(staff, expeditions);
    expect(results.length).toBe(2);
    expect(results[0].status).toBe('possible');
    expect(results[1].status).not.toBe('possible');
  });
});

describe('expeditionMatcher.ts - Multiple Staff Requirements', () => {
  it('should handle expeditions requiring multiple of same type', () => {
    const staff = [
      addSkill(createStaff('Guard 1', 'Security Guard'), 'Pilot Wings', 1),
      addSkill(createStaff('Guard 2', 'Security Guard'), 'Aerodynamics', 1),
    ];

    const expedition: Expedition = {
      name: 'Multi-Guard Expedition',
      map: 'Map',
      skillRequirements: [
        { skill: 'Pilot Wings' as any, level: 1 },
        { skill: 'Aerodynamics' as any, level: 1 },
      ],
      staffRequirements: [
        { type: 'Security Guard', count: 2 },
      ],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition(staff, expedition);
    expect(result.status).toBe('possible');
  });

  it('should fail when not enough staff of a type exists', () => {
    const staff = [
      addSkill(createStaff('Guard 1', 'Security Guard'), 'Pilot Wings', 1),
    ];

    const expedition: Expedition = {
      name: 'Multi-Guard Expedition',
      map: 'Map',
      skillRequirements: [
        { skill: 'Pilot Wings' as any, level: 1 },
      ],
      staffRequirements: [
        { type: 'Security Guard', count: 2 },  // Need 2, only have 1
      ],
      events: [],
      rewards: [],
    };

    const result = canFulfillExpedition(staff, expedition);
    expect(result.status).not.toBe('possible');
  });
});
