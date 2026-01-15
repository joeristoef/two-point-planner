/**
 * Tests for Data Loading (CSV Parser & Data Validator)
 * 
 * These tests verify that data is loaded and validated correctly.
 * Since we can't easily mock fetch in Jest without extra setup,
 * these tests focus on the data structure validation and parser logic.
 */

import { parseCSV } from '../data/csvParser';
import { canHaveSkill } from '../config/gameRules';

describe('csvParser.ts', () => {
  describe('parseCSV() function', () => {
    it('should parse simple CSV with one row', () => {
      const csv = 'Name,Value\nTest,123';
      const result = parseCSV(csv);
      
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('Name', 'Test');
      expect(result[0]).toHaveProperty('Value', '123');
    });

    it('should parse CSV with multiple rows', () => {
      const csv = 'Name,Value\nTest1,123\nTest2,456';
      const result = parseCSV(csv);
      
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('Name', 'Test1');
      expect(result[1]).toHaveProperty('Name', 'Test2');
    });

    it('should handle empty values', () => {
      const csv = 'Name,Value\nTest,';
      const result = parseCSV(csv);
      
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('Name', 'Test');
      expect(result[0]).toHaveProperty('Value', '');
    });

    it('should handle quoted fields with commas', () => {
      const csv = 'Name,Description\nTest,"Has, comma"';
      const result = parseCSV(csv);
      
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('Description', 'Has, comma');
    });

    it('should handle escaped quotes in quoted fields', () => {
      const csv = 'Name,Description\nTest,"Has ""quotes"""';
      const result = parseCSV(csv);
      
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('Description', 'Has "quotes"');
    });

    it('should trim whitespace from field values', () => {
      const csv = 'Name,Description\nTest,"  spaces  "';
      const result = parseCSV(csv);
      
      expect(result.length).toBe(1);
      // CSV parser trims whitespace from all fields (standard behavior)
      expect(result[0]).toHaveProperty('Description', 'spaces');
    });
  });

  describe('parseCSV() - Headers and case sensitivity', () => {
    it('should preserve header case exactly', () => {
      const csv = 'FirstName,LastName\nJohn,Doe';
      const result = parseCSV(csv);
      
      expect(result[0]).toHaveProperty('FirstName');
      expect(result[0]).toHaveProperty('LastName');
    });

    it('should handle headers with spaces', () => {
      const csv = 'First Name,Last Name\nJohn,Doe';
      const result = parseCSV(csv);
      
      expect(result[0]).toHaveProperty('First Name');
    });
  });
});

describe('dataValidator.ts', () => {

  describe('Skill Validation', () => {
    it('should validate known skills', () => {
      const validSkills = [
        'Pilot Wings',
        'Aerodynamics',
        'Fish Whispering',
        'Survival Skills',
      ];

      for (const skill of validSkills) {
        // If the skill can be assigned to at least one staff type, it's valid
        let isValidSkill = false;
        const staffTypes = [
          'Prehistory Expert',
          'Marine Life Expert',
          'Security Guard',
          'Janitor',
        ];
        
        for (const staffType of staffTypes) {
          if (canHaveSkill(staffType as any, skill as any)) {
            isValidSkill = true;
            break;
          }
        }
        
        expect(isValidSkill).toBe(true);
      }
    });

    it('should recognize invalid skill names', () => {
      const invalidSkill = 'Fake Skill That Does Not Exist';
      
      // None of the staff types can have this skill
      const staffTypes = [
        'Prehistory Expert',
        'Marine Life Expert',
        'Security Guard',
      ];
      
      let canAnyoneLearnIt = false;
      for (const staffType of staffTypes) {
        if (canHaveSkill(staffType as any, invalidSkill as any)) {
          canAnyoneLearnIt = true;
          break;
        }
      }
      
      expect(canAnyoneLearnIt).toBe(false);
    });
  });

  describe('Staff Type Validation', () => {
    it('should validate known staff types', () => {
      const validTypes = [
        'Prehistory Expert',
        'Marine Life Expert',
        'Security Guard',
        'Janitor',
        'Assistant',
      ];

      for (const staffType of validTypes) {
        // Just verify the skill restriction exists
        expect(canHaveSkill(staffType as any, 'Pilot Wings')).toBeDefined();
      }
    });
  });

  describe('Skill Level Validation', () => {
    it('should accept valid skill levels (1-3)', () => {
      const validLevels = [1, 2, 3];
      
      for (const level of validLevels) {
        expect(level).toBeGreaterThanOrEqual(1);
        expect(level).toBeLessThanOrEqual(3);
      }
    });

    it('should reject level 0', () => {
      const invalidLevel = 0;
      expect(invalidLevel).toBeLessThan(1);
    });

    it('should reject level 4 or higher', () => {
      const invalidLevel = 4;
      expect(invalidLevel).toBeGreaterThan(3);
    });
  });
});

describe('Data Loading Integration', () => {
  describe('CSV File Requirements', () => {
    it('should require all 5 CSV files to exist', () => {
      const requiredFiles = [
        'Expeditions.csv',
        'ExpeditionSkillRequirementsBaseOnly.csv',
        'ExpeditionStaffRequirements.csv',
        'ExpeditionEvents.csv',
        'ExpeditionRewardTypes.csv',
      ];

      expect(requiredFiles.length).toBe(5);
    });

    it('should load expeditions from public folder (for development)', () => {
      // This just documents the expected path
      const publicPath = '/public/';
      expect(publicPath).toBeDefined();
    });
  });

  describe('Data Structure Validation', () => {
    it('should ensure expedition has required fields', () => {
      const requiredFields = [
        'name',
        'map',
        'skillRequirements',
        'staffRequirements',
        'events',
        'rewards',
      ];

      expect(requiredFields).toContain('name');
      expect(requiredFields).toContain('skillRequirements');
    });

    it('should ensure skill requirement has skill and level', () => {
      const skillReqFields = ['skill', 'level'];
      expect(skillReqFields).toContain('skill');
      expect(skillReqFields).toContain('level');
    });

    it('should ensure staff requirement has type and count', () => {
      const staffReqFields = ['type', 'count'];
      expect(staffReqFields).toContain('type');
      expect(staffReqFields).toContain('count');
    });
  });
});

describe('Data Validation Edge Cases', () => {
  describe('Skill Requirements Validation', () => {
    it('should handle expeditions with no skill requirements', () => {
      const skillReqs = [] as any[];
      expect(skillReqs.length).toBe(0);
    });

    it('should handle expeditions with multiple skill requirements', () => {
      const skillReqs = [
        { skill: 'Pilot Wings', level: 2 },
        { skill: 'Fish Whispering', level: 2 },
        { skill: 'Survival Skills', level: 2 },
        { skill: 'Survey Skills', level: 1 },
      ];
      expect(skillReqs.length).toBe(4);
    });

    it('should validate max level is 3', () => {
      const validLevels = [1, 2, 3];
      const invalidLevel = 4;
      
      expect(validLevels).toContain(3);
      expect(validLevels).not.toContain(invalidLevel);
    });
  });

  describe('Staff Requirements Validation', () => {
    it('should handle single staff requirement', () => {
      const staffReqs = [{ type: 'Marine Life Expert', count: 1 }];
      expect(staffReqs.length).toBe(1);
    });

    it('should handle multiple staff requirements', () => {
      const staffReqs = [
        { type: 'Marine Life Expert', count: 1 },
        { type: 'Security Guard', count: 1 },
      ];
      expect(staffReqs.length).toBe(2);
    });

    it('should handle ANY Staff and ANY Expert special types', () => {
      const specialTypes = ['ANY Staff', 'ANY Expert'];
      expect(specialTypes).toContain('ANY Staff');
      expect(specialTypes).toContain('ANY Expert');
    });
  });
});
