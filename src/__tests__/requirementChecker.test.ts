import { checkRequirementsFulfillment } from '../utils/requirementChecker';
import { StaffMember, AccumulatedRequirements, Skill } from '../types/index';

describe('checkRequirementsFulfillment', () => {
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

  it('should return true when no requirements exist', () => {
    const roster = [createStaffMember('1', 'Staff Member 1')];
    const requirements: AccumulatedRequirements = {
      skills: [],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(true);
    expect(result.missingSkills).toHaveLength(0);
    expect(result.missingItems).toHaveLength(0);
    expect(result.missingRanks).toHaveLength(0);
    expect(result.missingStats).toHaveLength(0);
  });

  it('should return true when all skill requirements are met', () => {
    const roster = [
      createStaffMember('1', 'Staff Member 1', [['Digging', 3], ['Mechanics', 2]])
    ];
    const requirements: AccumulatedRequirements = {
      skills: [
        { name: 'Digging', level: 2 },
        { name: 'Mechanics', level: 1 }
      ],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(true);
    expect(result.missingSkills).toHaveLength(0);
  });

  it('should identify missing skills with insufficient level', () => {
    const roster = [
      createStaffMember('1', 'Staff Member 1', [['Digging', 1]])
    ];
    const requirements: AccumulatedRequirements = {
      skills: [{ name: 'Digging', level: 3 }],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingSkills).toHaveLength(1);
    expect(result.missingSkills[0]).toEqual({
      name: 'Digging',
      required: 3,
      available: 1
    });
  });

  it('should identify completely missing skills', () => {
    const roster = [
      createStaffMember('1', 'Staff Member 1', [['Mechanics', 2]])
    ];
    const requirements: AccumulatedRequirements = {
      skills: [{ name: 'Digging', level: 2 }],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingSkills).toHaveLength(1);
    expect(result.missingSkills[0]).toEqual({
      name: 'Digging',
      required: 2,
      available: 0
    });
  });

  it('should use max skill level across entire roster', () => {
    const roster = [
      createStaffMember('1', 'Staff Member 1', [['Digging', 1]]),
      createStaffMember('2', 'Staff Member 2', [['Digging', 2]]),
      createStaffMember('3', 'Staff Member 3', [['Digging', 3]])
    ];
    const requirements: AccumulatedRequirements = {
      skills: [{ name: 'Digging', level: 3 }],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(true);
    expect(result.missingSkills).toHaveLength(0);
  });

  it('should identify missing items', () => {
    const roster = [createStaffMember('1', 'Staff Member 1')];
    const requirements: AccumulatedRequirements = {
      skills: [],
      items: [{ name: 'Rope' }, { name: 'Lantern' }],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingItems).toEqual(['Rope', 'Lantern']);
  });

  it('should identify missing ranks', () => {
    const roster = [createStaffMember('1', 'Staff Member 1')];
    const requirements: AccumulatedRequirements = {
      skills: [],
      items: [],
      ranks: [{ name: 'Rank 2', level: 2 }, { name: 'Rank 3', level: 3 }],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingRanks).toEqual(['Rank 2', 'Rank 3']);
  });

  it('should identify missing stats', () => {
    const roster = [createStaffMember('1', 'Staff Member 1')];
    const requirements: AccumulatedRequirements = {
      skills: [],
      items: [],
      ranks: [],
      stats: [{ name: 'Strength', level: 3 }]
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingStats).toHaveLength(1);
    expect(result.missingStats[0]).toEqual({
      name: 'Strength',
      required: 3,
      available: 0
    });
  });

  it('should handle multiple missing items across categories', () => {
    const roster = [
      createStaffMember('1', 'Staff Member 1', [['Digging', 1]])
    ];
    const requirements: AccumulatedRequirements = {
      skills: [{ name: 'Digging', level: 3 }, { name: 'Mechanics', level: 2 }],
      items: [{ name: 'Rope' }],
      ranks: [{ name: 'Rank 2', level: 2 }],
      stats: [{ name: 'Strength', level: 2 }]
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingSkills).toHaveLength(2); // Digging insufficient, Mechanics missing
    expect(result.missingItems).toHaveLength(1);
    expect(result.missingRanks).toHaveLength(1);
    expect(result.missingStats).toHaveLength(1);
  });

  it('should handle empty roster', () => {
    const roster: StaffMember[] = [];
    const requirements: AccumulatedRequirements = {
      skills: [{ name: 'Digging', level: 2 }],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingSkills).toHaveLength(1);
    expect(result.missingSkills[0]).toEqual({
      name: 'Digging',
      required: 2,
      available: 0
    });
  });

  it('should handle exact skill level match', () => {
    const roster = [
      createStaffMember('1', 'Staff Member 1', [['Digging', 2]])
    ];
    const requirements: AccumulatedRequirements = {
      skills: [{ name: 'Digging', level: 2 }],
      items: [],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(true);
    expect(result.missingSkills).toHaveLength(0);
  });

  it('should mark items as missing (placeholder behavior)', () => {
    const roster = [createStaffMember('1', 'Staff Member 1')];
    const requirements: AccumulatedRequirements = {
      skills: [],
      items: [{ name: 'TestItem' }],
      ranks: [],
      stats: []
    };

    const result = checkRequirementsFulfillment(roster, requirements);
    expect(result.canFulfill).toBe(false);
    expect(result.missingItems).toContain('TestItem');
  });
});

