import { StaffMember, AccumulatedRequirements } from '../types/index';

export interface RequirementCheckResult {
  canFulfill: boolean;
  missingSkills: Array<{ name: string; required: number; available: number }>;
  missingItems: string[];
  missingRanks: string[];
  missingStats: Array<{ name: string; required: number; available: number }>;
}

/**
 * Checks if a staff roster can fulfill accumulated requirements.
 * 
 * @param roster - Array of staff members available
 * @param requirements - Accumulated requirements to check
 * @returns Result indicating what requirements can/cannot be met
 */
export function checkRequirementsFulfillment(
  roster: StaffMember[],
  requirements: AccumulatedRequirements
): RequirementCheckResult {
  const result: RequirementCheckResult = {
    canFulfill: true,
    missingSkills: [],
    missingItems: [],
    missingRanks: [],
    missingStats: []
  };

  // Check skills
  for (const reqSkill of requirements.skills) {
    const availableLevel = findMaxSkillLevel(roster, reqSkill.name);
    if (availableLevel < reqSkill.level) {
      result.missingSkills.push({
        name: reqSkill.name,
        required: reqSkill.level,
        available: availableLevel
      });
      result.canFulfill = false;
    }
  }

  // Sort missing skills by name for consistency
  result.missingSkills.sort((a, b) => a.name.localeCompare(b.name));

  // Check items (this would require adding inventory tracking to the data model)
  // For now, we mark items as missing but in practice this would check against inventory
  for (const item of requirements.items) {
    // TODO: Implement item inventory checking when inventory system is added
    // For now, assume items are missing (conservative approach)
    result.missingItems.push(item.name);
    result.canFulfill = false;
  }

  // Check ranks (this would require adding rank system to staff data)
  // For now, we mark ranks as missing but in practice this would check against staff ranks
  for (const rank of requirements.ranks) {
    // TODO: Implement rank checking when rank system is added
    // For now, assume ranks are missing (conservative approach)
    result.missingRanks.push(rank.name);
    result.canFulfill = false;
  }

  // Check stats (this would require adding stat tracking to the data model)
  // For now, we mark stats as missing but in practice this would check against stats
  for (const stat of requirements.stats) {
    // TODO: Implement stat checking when stat system is added
    // For now, assume stats are missing (conservative approach)
    result.missingStats.push({
      name: stat.name,
      required: stat.level,
      available: 0
    });
    result.canFulfill = false;
  }

  return result;
}

/**
 * Finds the maximum level of a skill across the entire roster.
 */
function findMaxSkillLevel(roster: StaffMember[], skillName: string): number {
  let maxLevel = 0;
  for (const staffMember of roster) {
    const skillLevel = staffMember.skills.get(skillName as any);
    if (skillLevel && skillLevel > maxLevel) {
      maxLevel = skillLevel;
    }
  }
  return maxLevel;
}
