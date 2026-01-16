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
  'War Turf': 'war-turf.webp',
  "Douse 'n Dose": 'douse-n-dose.webp',
  'Robo Janitor': 'robo-janitor-project.webp',
  'Robo Security Guard': 'robo-security-guard-project.webp',
};

// ============================================================================
// MAP ICONS
// ============================================================================

export const mapIcons: Record<string, string> = {
  'Bone Belt': 'bone-belt.webp',
  'Two Point Sea': 'two-point-sea.webp',
  'Bungle Burrows': 'bungle-burrows.webp',
  'Known Universe': 'known-universe.webp',
  'Netherworld': 'netherworld.webp',
  'Farflung Isles': 'farflung-isles.webp',
  'Scorched Earth': 'scorched-earth.webp',
  'Digiverse': 'digiverse.webp',
};

// ============================================================================
// ASSET PATH CONSTANTS - For reference only
// ============================================================================

// Note: Assets are served as /assets/{category}/{filename}
// - Dev: Vite serves /public/assets/ as /assets/
// - Prod: /dist/assets/ is served as /assets/

export const ASSET_CATEGORIES = {
  EXPEDITION_ICONS: 'expedition-icons',
  EVENT_ICONS: 'event-icons',
  REWARD_ICONS: 'reward-icons-2',
  SKILL_ICONS: 'skill-icons',
  STAFF_TYPE_ICONS: 'staff-type-icons',
  MAP_ICONS: 'map-icons',
} as const;

// ============================================================================
// NAME NORMALIZATION UTILITIES
// ============================================================================

/**
 * Normalize expedition name to filename format
 * Convention: lowercase-with-hyphens.webp
 * Example: "Stop Beaton & Deadhorse" -> "stop-beaton-n-deadhorse.webp"
 */
export const normalizeExpeditionName = (name: string): string => {
  return (
    name
      .toLowerCase() // convert to lowercase
      .replace(/\s+/g, '-') // spaces to hyphens
      .replace(/'/g, '') // remove apostrophes
      .replace(/&/g, 'n') + '.webp' // ampersand to 'n'
  );
};

/**
 * Normalize reward name to filename format
 * Convention: lowercase-with-hyphens.webp
 * Example: "Meaty Sword 3D" -> "meaty-sword-3d.webp"
 */
export const normalizeRewardName = (name: string): string => {
  return (
    name
      .toLowerCase() // convert to lowercase
      .replace(/'/g, '') // remove apostrophes
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/[()&]/g, '') // remove parentheses and ampersand
      + '.webp'
  );
};

/**
 * Normalize event name to filename format
 * Convention: lowercase-with-hyphens.webp
 * Example: "Aberrant Waterspout" -> "aberrant-waterspout.webp"
 */
export const normalizeEventName = (name: string): string => {
  return (
    name
      .toLowerCase() // convert to lowercase
      .replace(/'/g, '') // remove apostrophes
      .replace(/\s+/g, '-') // spaces to hyphens
      .replace(/!/g, '') // remove exclamation marks
      + '.webp'
  );
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
export const listRegisteredIcons = (category: keyof typeof ASSET_CATEGORIES): string[] => {
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
