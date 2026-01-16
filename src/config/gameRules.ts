/**
 * Game Rules Configuration
 * 
 * Centralized configuration for all game mechanics, skill restrictions,
 * and optimizer settings. This is the single source of truth for game rules.
 */

import { Skill, StaffType } from '../types/index';

// ============================================================================
// STAFF SYSTEM CONSTANTS
// ============================================================================

export const STAFF_SYSTEM = {
  maxSlots: 5,           // Maximum skill slots per staff member
  maxSkillLevel: 3,      // Maximum level any skill can reach
} as const;

// ============================================================================
// SKILL CATEGORIES
// ============================================================================

// Staff subtypes that belong to a parent type for matching purposes
// Subtypes are hired as distinct options but match as their parent type for expeditions
export const STAFF_SUBTYPES: Record<StaffType, StaffType | null> = {
  'Prehistory Expert': null,
  'Botany Expert': null,
  'Fantasy Expert': null,
  'Marine Life Expert': null,
  'Wildlife Expert': null,
  'Digital Expert': null,
  'Supernatural Expert': null,
  'Science Expert': null,
  'Space Expert': null,
  'Janitor': null,
  'Security Guard': null,
  'Assistant': null,
  'Barbarian': 'Fantasy Expert',
  'Bard': 'Fantasy Expert',
  'Rogue': 'Fantasy Expert',
  'Wizard': 'Fantasy Expert',
};

export const SKILL_CATEGORIES = {
  universal: [
    'Aerodynamics',
    'Happy Thoughts',
    'Pilot Wings',
  ] as const,

  expertOnly: [
    'Analysis',
    'Rapid Restoration',
    'Survey Skills',
    'Survival Skills',
    'Tour Guidelines',
  ] as const,

  typeExclusive: {
    'Fantasy Expert': ['Potion Master'],
    'Marine Life Expert': ['Fish Whispering'],
    'Wildlife Expert': ['Animal Analysis', 'Macro-Zoology', 'Micro-Zoology'],
    'Digital Expert': ['Button Master'],
    'Supernatural Expert': ['Spirit Whispering'],
    'Janitor': ['Fire-Resistance', 'Ghost Capture', 'Mechanics', 'Workshop'],
    'Security Guard': ['Camera Room', 'Strolling Surveillance'],
    'Assistant': ['Accomplished Admission', 'Customer Service', 'Marketing'],
    'Barbarian': [],
    'Bard': [],
    'Rogue': [],
    'Wizard': [],
  } as const,
} as const;

// ============================================================================
// SKILL RESTRICTIONS BY STAFF TYPE
// ============================================================================

export const SKILL_RESTRICTIONS: Record<StaffType, Set<Skill>> = {
  'Prehistory Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
  ]),

  'Botany Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
  ]),

  'Fantasy Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Potion Master',
  ]),

  'Marine Life Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Fish Whispering',
  ]),

  'Wildlife Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Animal Analysis',
    'Macro-Zoology',
    'Micro-Zoology',
  ]),

  'Digital Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Button Master',
  ]),

  'Supernatural Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Spirit Whispering',
  ]),

  'Science Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
  ]),

  'Space Expert': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
  ]),

  'Assistant': new Set([
    ...SKILL_CATEGORIES.universal as any,
    'Accomplished Admission',
    'Customer Service',
    'Marketing',
  ]),

  'Janitor': new Set([
    ...SKILL_CATEGORIES.universal as any,
    'Fire-Resistance',
    'Ghost Capture',
    'Mechanics',
    'Workshop',
  ]),

  'Security Guard': new Set([
    ...SKILL_CATEGORIES.universal as any,
    'Camera Room',
    'Strolling Surveillance',
  ]),

  'Barbarian': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Potion Master',
  ]),

  'Bard': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Potion Master',
  ]),

  'Rogue': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Potion Master',
  ]),

  'Wizard': new Set([
    ...SKILL_CATEGORIES.universal as any,
    ...SKILL_CATEGORIES.expertOnly as any,
    'Potion Master',
  ]),
};

// ============================================================================
// SKILL UTILITY PREFERENCES
// ============================================================================
// 
// Defines the non-expedition value of skills. These are preferences, not rules.
// Users may have different opinions on which skills are most valuable outside
// of expeditions. Values can be tweaked or made user-configurable in the future.
//
// utility: 1-10 scale indicating how valuable the skill is outside expeditions
// idealStaffType: which staff type benefits most from this skill (optional)
// notes: reasoning for the utility score (for documentation)

export const SKILL_UTILITY: Record<string, {
  utility: number;
  idealStaffType?: StaffType;
  notes: string;
}> = {
  'Aerodynamics': {
    utility: 8,
    idealStaffType: 'Security Guard',
    notes: 'Fast Security Guards catch criminals more easily. Useful on all staff, shines on Security Guards.',
  },

  'Pilot Wings': {
    utility: 7,
    notes: 'Speeds up expeditions. Valuable on any staff going on multiple expeditions. Generalizable benefit.',
  },

  'Happy Thoughts': {
    utility: 3,
    notes: 'Mostly useless outside specific expeditions (mostly Netherworld). Consider dedicated "mule" staff for this.',
  },

  'Fire-Resistance': {
    utility: 5,
    notes: 'Exclusive to Janitor. Useful in dangerous areas of the museum.',
  },

  'Ghost Capture': {
    utility: 4,
    notes: 'Exclusive to Janitor. Only useful if ghost incidents occur.',
  },

  'Camera Room': {
    utility: 4,
    notes: 'Exclusive to Security Guard. Improves security surveillance.',
  },

  // Other skills have minimal non-expedition utility and are not listed
  // (they're primarily expedition-specific)
};

// ============================================================================
// OPTIMIZER PRESETS
// ============================================================================
//
// Scaffolding for future optimizer modes. These will be refined during
// Phase 3.1 (Staff Optimizer development). Currently defined but not used.
//
// Modes represent different philosophies for staff optimization:
// - Perfectionist: Cover as many expeditions as possible, maximize flexibility
// - Pragmatist: Balance coverage with training effort
// - Efficient: Focus on specific expeditions, minimize training
// - Minimalist: Minimize staff count and training, accept limitations

export const OPTIMIZER_PRESETS = {
  'Perfectionist': {
    description: 'Cover as many expeditions as possible with maximum flexibility',
    prioritizeCompleteness: true,
    maximizeFlexibility: true,
    minimizeTraining: false,
  },

  'Pragmatist': {
    description: 'Balance expedition coverage with reasonable training effort',
    prioritizeCompleteness: true,
    maximizeFlexibility: true,
    minimizeTraining: true,
  },

  'Efficient': {
    description: 'Focus on specific expeditions with minimal training effort',
    prioritizeCompleteness: false,
    maximizeFlexibility: true,
    minimizeTraining: true,
  },

  'Minimalist': {
    description: 'Minimize staff count and training, accept inflexible compositions',
    prioritizeCompleteness: false,
    maximizeFlexibility: false,
    minimizeTraining: true,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all skills available to a specific staff type
 */
export function getAvailableSkills(staffType: StaffType): Skill[] {
  return Array.from(SKILL_RESTRICTIONS[staffType] || []);
}

/**
 * Check if a staff type can learn a specific skill
 */
export function canHaveSkill(staffType: StaffType, skill: Skill): boolean {
  return (SKILL_RESTRICTIONS[staffType] || new Set()).has(skill);
}

/**
 * Check if a staff type is an Expert
 */
export function isExpert(staffType: StaffType): boolean {
  return staffType.includes('Expert');
}

/**
 * Get maximum skill slots per staff member
 */
export function getMaxSkillSlots(): number {
  return STAFF_SYSTEM.maxSlots;
}

/**
 * Get maximum skill level
 */
export function getMaxSkillLevel(): number {
  return STAFF_SYSTEM.maxSkillLevel;
}

/**
 * Calculate how many skill slots are used by a staff member's skills
 */
export function calculateUsedSkillSlots(
  skills: Map<Skill, number>
): number {
  let total = 0;
  skills.forEach((level) => {
    total += level;
  });
  return total;
}

/**
 * Calculate remaining skill slots available
 */
export function calculateRemainingSkillSlots(
  skills: Map<Skill, number>
): number {
  return getMaxSkillSlots() - calculateUsedSkillSlots(skills);
}

/**
 * Get utility score for a skill (1-10 scale)
 * Returns 0 if skill has no defined utility outside expeditions
 */
export function getSkillUtility(skill: string): number {
  return SKILL_UTILITY[skill]?.utility ?? 0;
}
