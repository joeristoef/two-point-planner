/**
 * Asset Registry - Centralized source of truth for all static asset paths
 * 
 * This file defines:
 * - Icon and image file locations
 * - Naming conventions for each asset type
 * - Special case mappings where names don't match filenames
 * - Validation that all expected assets exist
 * 
 * Asset Organization:
 * - Source: /public/assets/ (served by Vite dev server and production)
 * - All files must exist in: /public/assets/{folder}/
 * - Accessed by: fetch('/asset-path') at runtime
 * 
 * Icon Types:
 * - expedition-icons: Expedition map/location images (150 files)
 * - event-icons: Event type indicators (135 files)
 * - reward-icons-2: Museum reward/artifact icons (325 files)
 * - skill-icons: Skill/ability icons (21 files)
 * - staff-type-icons: Staff specialist icons (14 files)
 * - map-icons: Map region icons (8 files)
 */

import { StaffType, Skill } from '../types/index';

// ============================================================================
// STAFF TYPE ICONS
// ============================================================================

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

// Special staff type icons (not tied to StaffType enum)
export const specialStaffTypeIcons: Record<string, string> = {
  'ANY Expert': 'expert.webp',
  'ANY Staff': 'staff.webp',
};

// ============================================================================
// SKILL ICONS
// ============================================================================

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

// ============================================================================
// REWARD ICONS - SPECIAL CASES
// ============================================================================

// Rewards where the filename doesn't match the name exactly
export const rewardSpecialCases: Record<string, string> = {
  'War Turf': 'War-Turf-29-Icon.webp',
  "Douse 'n Dose": 'Douse-n-Dose-Icon.webp',
  'Robo Janitor': 'Robo-Janitor-Project-Icon.webp',
  'Robo Security Guard': 'Robo-Security-Guard-Project-Icon.webp',
};

// ============================================================================
// MAP ICONS
// ============================================================================

export const mapIcons: Record<string, string> = {
  'Bone Belt': 'Bone-Belt-Icon.webp',
  'Two Point Sea': 'Two-Point-Sea-Icon.webp',
  'Bungle Burrows': 'Bungle-Burrows-Icon.webp',
  'Known Universe': 'Known-Universe-Icon.webp',
  'Netherworld': 'Netherworld-Icon.webp',
  'Farflung Isles': 'Farflung-Isles-Icon.webp',
  'Scorched Earth': 'Scorched-Earth-Icon.webp',
  'Digiverse': 'Digiverse-Icon.webp',
};

// ============================================================================
// ASSET PATH CONSTANTS
// ============================================================================

export const ASSET_PATHS = {
  EXPEDITION_ICONS: '/expedition-icons/',
  EVENT_ICONS: '/event-icons/',
  REWARD_ICONS: '/reward-icons-2/',
  SKILL_ICONS: '/skill-icons/',
  STAFF_TYPE_ICONS: '/staff-type-icons/',
  MAP_ICONS: '/map-icons/',
} as const;

// ============================================================================
// NAME NORMALIZATION UTILITIES
// ============================================================================

/**
 * Normalize expedition name to filename format
 * Example: "Stop Beaton & Deadhorse" -> "Stop-Beaton-n-Deadhorse.webp"
 */
export const normalizeExpeditionName = (name: string): string => {
  return (
    name
      .replace(/\s+/g, '-') // spaces to hyphens
      .replace(/'/g, '') // remove apostrophes
      .replace(/&/g, 'n') + '.webp' // ampersand to 'n'
  );
};

/**
 * Normalize reward name to filename format
 * Example: "Meaty Sword 3D" -> "Meaty-Sword-3D-Icon.webp"
 */
export const normalizeRewardName = (name: string): string => {
  const smallWords = new Set([
    'a', 'an', 'and', 'or', 'of', 'the', 'in', 'at', 'by', 'for',
  ]);

  const normalized = name
    .replace(/'/g, '') // remove apostrophes
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/[()&]/g, '') // remove parentheses and ampersand
    .split('-')
    .map((word, index) => {
      // Don't capitalize small words, except the first word
      if (index > 0 && smallWords.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Capitalize first letter if it's a letter, keep rest as-is
      if (word.length === 0) return word;
      const firstChar = word.charAt(0);
      if (/[a-z]/.test(firstChar)) {
        return firstChar.toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('-');

  return `${normalized}-Icon.webp`;
};

// ============================================================================
// VALIDATION & DEBUGGING
// ============================================================================

/**
 * Get all registered icons for a category (for validation/debugging)
 */
export const getIconCount = (): {
  staffTypes: number;
  skills: number;
  maps: number;
} => ({
  staffTypes: Object.keys(staffTypeIcons).length,
  skills: Object.keys(skillIcons).length,
  maps: Object.keys(mapIcons).length,
});

/**
 * List all registered icons in a category
 */
export const listRegisteredIcons = (category: keyof typeof ASSET_PATHS): string[] => {
  switch (category) {
    case 'STAFF_TYPE_ICONS':
      return Object.keys(staffTypeIcons);
    case 'SKILL_ICONS':
      return Object.keys(skillIcons);
    case 'MAP_ICONS':
      return Object.keys(mapIcons);
    default:
      return [];
  }
};
