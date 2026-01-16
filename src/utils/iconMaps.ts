/**
 * Icon Map Utilities - Get icon paths for all asset types
 * 
 * Uses assetRegistry.ts as the centralized source of truth for all mappings.
 * Returns paths that work in both dev (Vite) and production (static serving).
 */

import {
  staffTypeIcons,
  specialStaffTypeIcons,
  skillIcons,
  rewardSpecialCases,
  rewardSpecialIconFolders,
  mapIcons,
  normalizeExpeditionName,
  normalizeEventName,
  normalizeRewardName,
} from '../config/assetRegistry';
import { StaffType, Skill } from '../types/index';

// ============================================================================
// ASSET PATH CONSTRUCTION
// ============================================================================

/**
 * In Vite + static assets:
 * - During dev: /public/assets/ is served from root as /assets/
 * - During production: /public/assets/ is copied to /dist/assets/ and served as /assets/
 * 
 * So we construct paths as /assets/{category}/{filename}
 */
const getAssetPath = (category: string, filename: string): string => {
  return `/assets/${category}/${filename}`;
};

// ============================================================================
// STAFF TYPE ICONS
// ============================================================================

export const getStaffTypeIcon = (staffType: string): string => {
  // Check special cases first (ANY Expert, ANY Staff)
  if (staffType in specialStaffTypeIcons) {
    const filename = specialStaffTypeIcons[staffType];
    return getAssetPath('staff-type-icons', filename);
  }

  // Check regular staff types
  const iconFile = staffTypeIcons[staffType as StaffType] || 'default.webp';
  return getAssetPath('staff-type-icons', iconFile);
};

// ============================================================================
// SKILL ICONS
// ============================================================================

export const getSkillIcon = (skill: Skill): string => {
  const iconFile = skillIcons[skill] || 'default.webp';
  return getAssetPath('skill-icons', iconFile);
};

// ============================================================================
// EXPEDITION ICONS
// ============================================================================

export const getExpeditionIcon = (expeditionName: string): string => {
  const filename = normalizeExpeditionName(expeditionName);
  return getAssetPath('expedition-icons', filename);
};

// ============================================================================
// EVENT ICONS
// ============================================================================

export const getEventIcon = (eventName: string): string => {
  const filename = normalizeEventName(eventName);
  return getAssetPath('event-icons', filename);
};

// ============================================================================
// REWARD ICONS
// ============================================================================

// List of known perk names for icon resolution
const PERK_NAMES = new Set([
  'Wide Watch', 'High Alert', 'Haunt Halter', 'Big Knowledge Boost',
  'Buzz Boost', 'Built-in Speaker', 'Anti-Rust',
  'Decoration Boost', 'Decoration & Entertainment Boost', 'Limited Edition',
  'Duration Boost', 'Energy Boost', 'Entertainment Boost',
  'Battery Saver', 'Cheap Charge', 'Fast Charge', 'Chrome Cover',
  'Buzz & Duration Boost', 'Buzz & Energy Boost', 'Buzz & Entertainment Boost',
  'Supportive Soil', 'Knowledge Boost', 'Easy Fixture'
]);

export const getRewardIcon = (rewardName: string): string => {
  // Check special icon folders first (misc-icons, etc.)
  if (rewardName in rewardSpecialIconFolders) {
    const special = rewardSpecialIconFolders[rewardName];
    return getAssetPath(special.folder, special.filename);
  }

  // Check if it's a perk
  if (PERK_NAMES.has(rewardName)) {
    const filename = normalizeRewardName(rewardName);
    return getAssetPath('perk-icons', filename);
  }

  // Check special cases in reward-icons-2 folder
  if (rewardName in rewardSpecialCases) {
    return getAssetPath('reward-icons-2', rewardSpecialCases[rewardName]);
  }

  // Use standard normalization for regular rewards
  const filename = normalizeRewardName(rewardName);
  return getAssetPath('reward-icons-2', filename);
};

// ============================================================================
// MAP ICONS
// ============================================================================

export const getMapIcon = (mapName: string): string => {
  const iconFile = mapIcons[mapName];
  if (!iconFile) return '';
  return getAssetPath('map-icons', iconFile);
};

// ============================================================================
// REWARD CATEGORY ICONS
// ============================================================================

export const getRewardCategoryIcon = (categoryName: string): string => {
  // Special handling for category icons
  if (categoryName === 'Perks') {
    return getAssetPath('misc-icons', 'perks.webp');
  }
  if (categoryName === 'Bonus XP') {
    return getAssetPath('misc-icons', 'xp.webp');
  }
  if (categoryName === 'Money') {
    return getAssetPath('misc-icons', 'currency.webp');
  }
  return '';
};

// ============================================================================
// DEPRECATED EXPORTS (for backwards compatibility)
// ============================================================================

// Re-export from registry for backwards compatibility
export { staffTypeIcons, skillIcons } from '../config/assetRegistry';
