import { Skill, StaffType } from '../types/index';

const UNIVERSAL_SKILLS: Set<Skill> = new Set([
  'Aerodynamics',
  'Happy Thoughts',
  'Pilot Wings',
]);

const EXPERT_SKILLS: Set<Skill> = new Set([
  'Analysis',
  'Rapid Restoration',
  'Survey Skills',
  'Survival Skills',
  'Tour Guidelines',
]);

const SKILL_RESTRICTIONS: Record<StaffType, Set<Skill>> = {
  'General Staff': UNIVERSAL_SKILLS,
  'Prehistory Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
  ]),
  'Botany Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
  ]),
  'Fantasy Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
    'Potion Master',
  ]),
  'Marine Life Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
    'Fish Whispering',
  ]),
  'Wildlife Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
    'Animal Analysis',
    'Macro-Zoology',
    'Micro-Zoology',
  ]),
  'Digital Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
    'Button Master',
  ]),
  'Supernatural Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
    'Spirit Whispering',
  ]),
  'Science Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
  ]),
  'Space Expert': new Set([
    ...UNIVERSAL_SKILLS,
    ...EXPERT_SKILLS,
  ]),
  'Assistant': new Set([
    ...UNIVERSAL_SKILLS,
    'Accomplished Admission',
    'Customer Service',
    'Marketing',
  ]),
  'Janitor': new Set([
    ...UNIVERSAL_SKILLS,
    'Fire-Resistance',
    'Ghost Capture',
    'Mechanics',
    'Workshop',
  ]),
  'Security Guard': new Set([
    ...UNIVERSAL_SKILLS,
    'Camera Room',
    'Strolling Surveillance',
  ]),
};

export function getAvailableSkills(staffType: StaffType): Skill[] {
  return Array.from(SKILL_RESTRICTIONS[staffType] || []);
}

export function canHaveSkill(staffType: StaffType, skill: Skill): boolean {
  return (SKILL_RESTRICTIONS[staffType] || new Set()).has(skill);
}

export function isExpert(staffType: StaffType): boolean {
  return staffType.includes('Expert');
}

export function getMaxSkillSlots(): number {
  return 5;
}

export function getMaxSkillLevel(): number {
  return 3;
}

export function calculateUsedSkillSlots(
  skills: Map<Skill, number>
): number {
  let total = 0;
  skills.forEach((level) => {
    total += level;
  });
  return total;
}
