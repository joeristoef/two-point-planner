/**
 * Icon Map Utilities - Get absolute icon paths for all asset types
 * 
 * Uses assetRegistry.ts as the centralized source of truth for all mappings.
 * Returns absolute paths (/asset-name) that work in both dev and production.
 */

import {
  staffTypeIcons,
  specialStaffTypeIcons,
  skillIcons,
  rewardSpecialCases,
  mapIcons,
  ASSET_PATHS,
  normalizeExpeditionName,
  normalizeRewardName,
} from '../config/assetRegistry';
import { StaffType, Skill } from '../types/index';

// ============================================================================
// STAFF TYPE ICONS
// ============================================================================

export const getStaffTypeIcon = (staffType: string): string => {
  // Check special cases first (ANY Expert, ANY Staff)
  if (staffType in specialStaffTypeIcons) {
    const filename = specialStaffTypeIcons[staffType];
    return `${ASSET_PATHS.STAFF_TYPE_ICONS}${filename}`;
  }

  // Check regular staff types
  const iconFile = staffTypeIcons[staffType as StaffType] || 'default.webp';
  return `${ASSET_PATHS.STAFF_TYPE_ICONS}${iconFile}`;
};

// ============================================================================
// SKILL ICONS
// ============================================================================

export const getSkillIcon = (skill: Skill): string => {
  const iconFile = skillIcons[skill] || 'default.webp';
  return `${ASSET_PATHS.SKILL_ICONS}${iconFile}`;
};

// ============================================================================
// EXPEDITION ICONS
// ============================================================================

export const getExpeditionIcon = (expeditionName: string): string => {
  const filename = normalizeExpeditionName(expeditionName);
  return `${ASSET_PATHS.EXPEDITION_ICONS}${filename}`;
};

// ============================================================================
// REWARD ICONS
// ============================================================================

export const getRewardIcon = (rewardName: string): string => {
  // Check special cases first
  if (rewardName in rewardSpecialCases) {
    return `${ASSET_PATHS.REWARD_ICONS}${rewardSpecialCases[rewardName]}`;
  }

  // Use standard normalization
  const filename = normalizeRewardName(rewardName);
  return `${ASSET_PATHS.REWARD_ICONS}${filename}`;
};

// ============================================================================
// MAP ICONS
// ============================================================================

export const getMapIcon = (mapName: string): string => {
  const iconFile = mapIcons[mapName];
  if (!iconFile) return '';
  return `${ASSET_PATHS.MAP_ICONS}${iconFile}`;
};

// ============================================================================
// DEPRECATED EXPORTS (for backwards compatibility)
// ============================================================================

// Re-export from registry for backwards compatibility
export { staffTypeIcons, skillIcons } from '../config/assetRegistry';
