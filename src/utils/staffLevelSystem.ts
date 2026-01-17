/**
 * Calculates the number of available skill slots for a staff member based on their level.
 * Level 1: 1 slot
 * Level 5: 2 slots
 * Level 10: 3 slots
 * Level 15: 4 slots
 * Level 20+: 5 slots
 */
export function getAvailableSkillSlots(level: number): number {
  if (level < 5) return 1;
  if (level < 10) return 2;
  if (level < 15) return 3;
  if (level < 20) return 4;
  return 5;
}

/**
 * Validates and constrains a level to the valid range (1-20)
 */
export function constrainLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.round(level)));
}
