import { StaffType, Skill } from '../types/index';

// Staff type icons - map to your icon filenames
export const staffTypeIcons: Record<StaffType, string> = {
  'General Staff': 'general-staff.webp',
  'Prehistory Expert': 'prehistory-expert.webp',
  'Botany Expert': 'botany-expert.webp',
  'Fantasy Expert': 'fantasy-expert.webp',
  'Marine Life Expert': 'marine-life-expert.webp',
  'Wildlife Expert': 'wildlife-expert.webp',
  'Digital Expert': 'digital-expert.webp',
  'Supernatural Expert': 'supernatural-expert.webp',
  'Science Expert': 'science-expert.webp',
  'Space Expert': 'space-expert.webp',
  'Assistant': 'assistant.webp',
  'Janitor': 'janitor.webp',
  'Security Guard': 'security-guard.webp',
};

// Skill icons - map to your icon filenames
export const skillIcons: Record<Skill, string> = {
  'Aerodynamics': 'aerodynamics.webp',
  'Happy Thoughts': 'happy-thoughts.webp',
  'Pilot Wings': 'pilot-wings.webp',
  'Analysis': 'analysis.webp',
  'Rapid Restoration': 'rapid-restoration.webp',
  'Survey Skills': 'survey-skills.webp',
  'Survival Skills': 'survival-skills.webp',
  'Tour Guidelines': 'tour-guidelines.webp',
  'Animal Analysis': 'animal-analysis.webp',
  'Macro-Zoology': 'macro-zoology.webp',
  'Micro-Zoology': 'micro-zoology.webp',
  'Button Master': 'button-master.webp',
  'Fish Whispering': 'fish-whispering.webp',
  'Potion Master': 'potion-master.webp',
  'Spirit Whispering': 'spirit-whispering.webp',
  'Accomplished Admission': 'accomplished-admission.webp',
  'Customer Service': 'customer-service.webp',
  'Marketing': 'marketing.webp',
  'Fire-Resistance': 'fire-resistance.webp',
  'Ghost Capture': 'ghost-capture.webp',
  'Mechanics': 'mechanics.webp',
  'Workshop': 'workshop.webp',
  'Camera Room': 'camera-room.webp',
  'Strolling Surveillance': 'strolling-surveillance.webp',
};

export const getStaffTypeIcon = (staffType: string): string => {
  if (staffType === 'ANY Expert') {
    return '/assets/staff-type-icons/expert.webp';
  }
  if (staffType === 'ANY Staff') {
    return '/assets/staff-type-icons/staff.webp';
  }
  return `/assets/staff-type-icons/${staffTypeIcons[staffType as StaffType] || 'default.webp'}`;
};

export const getSkillIcon = (skill: Skill): string => {
  return `/assets/skill-icons/${skillIcons[skill] || 'default.webp'}`;
};

export const getExpeditionIcon = (expeditionName: string): string => {
  // Convert expedition name to filename format (spaces to hyphens, remove apostrophes, & to n)
  const filename = expeditionName
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/&/g, 'n') + '.webp';
  return `/assets/expedition-icons/${filename}`;
};
