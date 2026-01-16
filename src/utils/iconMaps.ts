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
  mapIcons,
  normalizeExpeditionName,
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
// REWARD ICONS
// ============================================================================

export const getRewardIcon = (rewardName: string): string => {
  // Check special cases first
  if (rewardName in rewardSpecialCases) {
    return getAssetPath('reward-icons-2', rewardSpecialCases[rewardName]);
  }

  // Use standard normalization
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
// DEPRECATED EXPORTS (for backwards compatibility)
// ============================================================================

// Re-export from registry for backwards compatibility
export { staffTypeIcons, skillIcons } from '../config/assetRegistry';
