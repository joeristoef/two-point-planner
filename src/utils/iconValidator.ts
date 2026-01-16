/**
 * Icon Validator Utility - Validates that all registered icons exist
 * 
 * This utility checks:
 * - All staffType icons exist in /public/assets/staff-type-icons/
 * - All skill icons exist in /public/assets/skill-icons/
 * - All map icons exist in /public/assets/map-icons/
 * - All special case reward icons exist
 * 
 * Usage:
 * - Import in development/testing only
 * - Call validateAssets() to run full validation
 * - Call validateIcon(path) to check a specific icon
 * 
 * Note: This is a development tool and may impact performance if called
 * repeatedly in production. Consider using it in tests or dev mode only.
 */

import {
  staffTypeIcons,
  specialStaffTypeIcons,
  skillIcons,
  rewardSpecialCases,
  mapIcons,
  ASSET_PATHS,
} from '../config/assetRegistry';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
  warnings: string[];
  summary: {
    checked: number;
    found: number;
    missing: number;
  };
}

interface IconCheck {
  path: string;
  category: string;
  name: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if an icon file exists by attempting to fetch it
 * Returns true if the fetch succeeds (status 200), false otherwise
 */
export const validateIcon = async (
  iconPath: string,
): Promise<boolean> => {
  try {
    const response = await fetch(iconPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Check multiple icons in parallel
 */
export const validateIcons = async (
  iconPaths: string[],
): Promise<Map<string, boolean>> => {
  const results = new Map<string, boolean>();
  const promises = iconPaths.map(async (path) => {
    const isValid = await validateIcon(path);
    results.set(path, isValid);
  });

  await Promise.all(promises);
  return results;
};

// ============================================================================
// FULL VALIDATION
// ============================================================================

/**
 * Validate all registered assets
 * Returns a detailed report of any issues found
 */
export const validateAllAssets = async (): Promise<ValidationResult> => {
  const checks: IconCheck[] = [];
  const missing: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Staff Type Icons
  Object.entries(staffTypeIcons).forEach(([name, file]) => {
    checks.push({
      path: `${ASSET_PATHS.STAFF_TYPE_ICONS}${file}`,
      category: 'Staff Type',
      name,
    });
  });

  // Special Staff Type Icons
  Object.entries(specialStaffTypeIcons).forEach(([name, file]) => {
    checks.push({
      path: `${ASSET_PATHS.STAFF_TYPE_ICONS}${file}`,
      category: 'Special Staff Type',
      name,
    });
  });

  // Skill Icons
  Object.entries(skillIcons).forEach(([name, file]) => {
    checks.push({
      path: `${ASSET_PATHS.SKILL_ICONS}${file}`,
      category: 'Skill',
      name,
    });
  });

  // Map Icons
  Object.entries(mapIcons).forEach(([name, file]) => {
    checks.push({
      path: `${ASSET_PATHS.MAP_ICONS}${file}`,
      category: 'Map',
      name,
    });
  });

  // Reward Special Cases
  Object.entries(rewardSpecialCases).forEach(([name, file]) => {
    checks.push({
      path: `${ASSET_PATHS.REWARD_ICONS}${file}`,
      category: 'Reward (Special)',
      name,
    });
  });

  // Validate all in parallel
  const results = await validateIcons(checks.map((c) => c.path));

  // Process results
  checks.forEach((check) => {
    const isValid = results.get(check.path);
    if (!isValid) {
      missing.push(`${check.category}: "${check.name}" (${check.path})`);
    }
  });

  // Summary
  const found = checks.length - missing.length;

  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors,
    warnings,
    summary: {
      checked: checks.length,
      found,
      missing: missing.length,
    },
  };
};

// ============================================================================
// CATEGORY-SPECIFIC VALIDATION
// ============================================================================

/**
 * Validate only staff type icons
 */
export const validateStaffTypeIcons = async (): Promise<ValidationResult> => {
  const checks = Object.entries(staffTypeIcons).map(([name, file]) => ({
    path: `${ASSET_PATHS.STAFF_TYPE_ICONS}${file}`,
    category: 'Staff Type',
    name,
  }));

  const results = await validateIcons(checks.map((c) => c.path));
  const missing = checks
    .filter((c) => !results.get(c.path))
    .map((c) => `${c.name} (${c.path})`);

  return {
    valid: missing.length === 0,
    missing,
    errors: [],
    warnings: [],
    summary: {
      checked: checks.length,
      found: checks.length - missing.length,
      missing: missing.length,
    },
  };
};

/**
 * Validate only skill icons
 */
export const validateSkillIcons = async (): Promise<ValidationResult> => {
  const checks = Object.entries(skillIcons).map(([name, file]) => ({
    path: `${ASSET_PATHS.SKILL_ICONS}${file}`,
    category: 'Skill',
    name,
  }));

  const results = await validateIcons(checks.map((c) => c.path));
  const missing = checks
    .filter((c) => !results.get(c.path))
    .map((c) => `${c.name} (${c.path})`);

  return {
    valid: missing.length === 0,
    missing,
    errors: [],
    warnings: [],
    summary: {
      checked: checks.length,
      found: checks.length - missing.length,
      missing: missing.length,
    },
  };
};

/**
 * Validate only map icons
 */
export const validateMapIcons = async (): Promise<ValidationResult> => {
  const checks = Object.entries(mapIcons).map(([name, file]) => ({
    path: `${ASSET_PATHS.MAP_ICONS}${file}`,
    category: 'Map',
    name,
  }));

  const results = await validateIcons(checks.map((c) => c.path));
  const missing = checks
    .filter((c) => !results.get(c.path))
    .map((c) => `${c.name} (${c.path})`);

  return {
    valid: missing.length === 0,
    missing,
    errors: [],
    warnings: [],
    summary: {
      checked: checks.length,
      found: checks.length - missing.length,
      missing: missing.length,
    },
  };
};

// ============================================================================
// LOGGING & DEBUG HELPERS
// ============================================================================

/**
 * Log validation results in a human-readable format
 */
export const logValidationResults = (result: ValidationResult): void => {
  console.log('\\n=== Asset Validation Results ===');
  console.log(`Status: ${result.valid ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Checked: ${result.summary.checked}`);
  console.log(`Found: ${result.summary.found}`);
  console.log(`Missing: ${result.summary.missing}`);

  if (result.missing.length > 0) {
    console.log('\\nMissing Assets:');
    result.missing.forEach((m) => console.log(`  - ${m}`));
  }

  if (result.errors.length > 0) {
    console.log('\\nErrors:');
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log('\\nWarnings:');
    result.warnings.forEach((w) => console.log(`  - ${w}`));
  }
};
