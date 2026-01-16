import { Skill, StaffType } from '../types/index';

// Valid staff types from types/index.ts
const VALID_STAFF_TYPES: Set<string> = new Set([
  'Prehistory Expert',
  'Botany Expert',
  'Fantasy Expert',
  'Marine Life Expert',
  'Wildlife Expert',
  'Digital Expert',
  'Supernatural Expert',
  'Science Expert',
  'Space Expert',
  'Assistant',
  'Janitor',
  'Security Guard',
  'Barbarian',
  'Bard',
  'Rogue',
  'Wizard',
  'ANY Staff',
  'ANY Expert',
]);

// Valid skills from types/index.ts
const VALID_SKILLS: Set<Skill> = new Set([
  'Aerodynamics',
  'Happy Thoughts',
  'Pilot Wings',
  'Analysis',
  'Rapid Restoration',
  'Survey Skills',
  'Survival Skills',
  'Tour Guidelines',
  'Animal Analysis',
  'Macro-Zoology',
  'Micro-Zoology',
  'Button Master',
  'Fish Whispering',
  'Potion Master',
  'Spirit Whispering',
  'Accomplished Admission',
  'Customer Service',
  'Marketing',
  'Fire-Resistance',
  'Ghost Capture',
  'Mechanics',
  'Workshop',
  'Camera Room',
  'Strolling Surveillance',
]);

export interface ValidationError {
  file: string;
  row: number;
  field: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export class DataValidator {
  private errors: ValidationError[] = [];

  validateSkillRequirement(
    rowNum: number,
    skill: string,
    level: string
  ): boolean {
    // Check skill exists
    if (!VALID_SKILLS.has(skill as Skill)) {
      this.errors.push({
        file: 'ExpeditionSkillRequirementsBaseOnly.csv',
        row: rowNum,
        field: 'Skill',
        value: skill,
        message: `Unknown skill "${skill}". Valid skills: ${Array.from(VALID_SKILLS).join(', ')}`,
        severity: 'error',
      });
      return false;
    }

    // Check level is numeric
    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 3) {
      this.errors.push({
        file: 'ExpeditionSkillRequirementsBaseOnly.csv',
        row: rowNum,
        field: 'Level',
        value: level,
        message: `Invalid skill level "${level}". Must be 1-3.`,
        severity: 'error',
      });
      return false;
    }

    return true;
  }

  validateStaffRequirement(
    rowNum: number,
    staffType: string,
    count: string
  ): boolean {
    // Check staff type exists
    if (!VALID_STAFF_TYPES.has(staffType as StaffType)) {
      this.errors.push({
        file: 'ExpeditionStaffRequirements.csv',
        row: rowNum,
        field: 'StaffType',
        value: staffType,
        message: `Unknown staff type "${staffType}". Valid types: ${Array.from(VALID_STAFF_TYPES).join(', ')}`,
        severity: 'error',
      });
      return false;
    }

    // Check count is numeric
    const countNum = parseInt(count, 10);
    if (isNaN(countNum) || countNum < 1) {
      this.errors.push({
        file: 'ExpeditionStaffRequirements.csv',
        row: rowNum,
        field: 'Count',
        value: count,
        message: `Invalid staff count "${count}". Must be a positive number.`,
        severity: 'error',
      });
      return false;
    }

    return true;
  }

  validateEventCounter(
    expeditionName: string,
    rowNum: number,
    counterType: string,
    counterValue: string
  ): boolean {
    // Events can have counters that are skills, stats, ranks, or items
    // Skills are validated similarly
    if (counterType === 'Skill' && counterValue) {
      if (!VALID_SKILLS.has(counterValue as Skill)) {
        this.errors.push({
          file: 'ExpeditionEvents.csv',
          row: rowNum,
          field: 'EventunlockSkill',
          value: counterValue,
          message: `Unknown skill counter "${counterValue}" in event for "${expeditionName}".`,
          severity: 'warning', // Warning, not error, since stats/items might be new
        });
        return false;
      }
    }

    return true;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.some((e) => e.severity === 'error');
  }

  printReport(): void {
    if (this.errors.length === 0) {
      console.log('✅ Data validation passed! No errors found.');
      return;
    }

    const grouped = this.errors.reduce(
      (acc, err) => {
        if (!acc[err.file]) acc[err.file] = [];
        acc[err.file].push(err);
        return acc;
      },
      {} as Record<string, ValidationError[]>
    );

    Object.entries(grouped).forEach(([file, errs]) => {
      console.group(`📋 ${file}`);
      errs.forEach((err) => {
        const icon = err.severity === 'error' ? '❌' : '⚠️';
        console.log(
          `${icon} Row ${err.row}, ${err.field}: ${err.message}`
        );
      });
      console.groupEnd();
    });

    const errorCount = this.errors.filter((e) => e.severity === 'error').length;
    const warningCount = this.errors.filter((e) => e.severity === 'warning').length;
    console.log(`\n📊 Summary: ${errorCount} errors, ${warningCount} warnings`);
  }
}
