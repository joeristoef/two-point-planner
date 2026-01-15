import { StaffType, Skill } from '../types/index';

// Staff type icons - map to your icon filenames
export const staffTypeIcons: Record<StaffType, string> = {
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
    return new URL('../assets/staff-type-icons/expert.webp', import.meta.url).href;
  }
  if (staffType === 'ANY Staff') {
    return new URL('../assets/staff-type-icons/staff.webp', import.meta.url).href;
  }
  const iconFile = staffTypeIcons[staffType as StaffType] || 'default.webp';
  return new URL(`../assets/staff-type-icons/${iconFile}`, import.meta.url).href;
};

export const getSkillIcon = (skill: Skill): string => {
  const iconFile = skillIcons[skill] || 'default.webp';
  return new URL(`../assets/skill-icons/${iconFile}`, import.meta.url).href;
};

export const getExpeditionIcon = (expeditionName: string): string => {
  // Convert expedition name to filename format (spaces to hyphens, remove apostrophes, & to n)
  const filename = expeditionName
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/&/g, 'n') + '.webp';
  return new URL(`../assets/expedition-icons/${filename}`, import.meta.url).href;
};

export const getRewardIcon = (rewardName: string): string => {
  // Special case mappings for rewards where the name doesn't match the filename
  const specialCases: Record<string, string> = {
    'War Turf': 'War-Turf-29-Icon.webp',
    "Douse 'n Dose": 'Douse-n-Dose-Icon.webp',
    'Robo Janitor': 'Robo-Janitor-Project-Icon.webp',
    'Robo Security Guard': 'Robo-Security-Guard-Project-Icon.webp',
  };
  
  if (specialCases[rewardName]) {
    return new URL(`../assets/reward-icons-2/${specialCases[rewardName]}`, import.meta.url).href;
  }
  
  // Convert reward name to filename format: "Meaty Sword 3D" -> "Meaty-Sword-3D-Icon.webp"
  // 1. Remove apostrophes
  // 2. Replace spaces with hyphens
  // 3. Remove parentheses and ampersand
  // 4. Capitalize first letter of each word (except small articles), preserve numbers and uppercase letters
  // 5. Append "-Icon.webp"
  
  const smallWords = new Set(['a', 'an', 'and', 'or', 'of', 'the', 'in', 'at', 'by', 'for']);
  
  const normalized = rewardName
    .replace(/'/g, '') // Remove apostrophes
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[()&]/g, '') // Remove parentheses and ampersand
    .split('-')
    .map((word, index) => {
      // Don't capitalize small words, except the first word
      if (index > 0 && smallWords.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Capitalize first letter if it's a letter, keep rest as-is for mixed case (like 3D)
      if (word.length === 0) return word;
      const firstChar = word.charAt(0);
      if (/[a-z]/.test(firstChar)) {
        return firstChar.toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('-');
  
  return new URL(`../assets/reward-icons-2/${normalized}-Icon.webp`, import.meta.url).href;
};

export const getMapIcon = (mapName: string): string => {
  // Map names to their icon filenames
  const mapIcons: Record<string, string> = {
    'Bone Belt': 'Bone-Belt-Icon.webp',
    'Two Point Sea': 'Two-Point-Sea-Icon.webp',
    'Bungle Burrows': 'Bungle-Burrows-Icon.webp',
    'Known Universe': 'Known-Universe-Icon.webp',
    'Netherworld': 'Netherworld-Icon.webp',
    'Farflung Isles': 'Farflung-Isles-Icon.webp',
    'Scorched Earth': 'Scorched-Earth-Icon.webp',
    'Digiverse': 'Digiverse-Icon.webp',
  };
  
  const iconFile = mapIcons[mapName];
  if (!iconFile) return '';
  return new URL(`../assets/map-icons/${iconFile}`, import.meta.url).href;
};
