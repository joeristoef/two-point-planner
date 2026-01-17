import { Expedition, Skill, StaffType, Requirement } from '../types/index';
import { parseCSV } from './csvParser';
import { DataValidator } from './dataValidator';

/**
 * Parse EventCounter data into normalized Requirement array
 * Handles Skill, Stat, Rank, and Item requirements
 */
function parseEventRequirements(counter: {
  skill?: string;
  skillLevel?: number;
  rank?: number;
  stat?: string;
  statLevel?: number;
  item?: string;
}): Requirement[] {
  const requirements: Requirement[] = [];

  if (counter.skill) {
    requirements.push({
      type: 'Skill',
      name: counter.skill,
      level: counter.skillLevel,
    });
  }

  if (counter.stat) {
    requirements.push({
      type: 'Stat',
      name: counter.stat,
      level: counter.statLevel,
    });
  }

  if (counter.rank) {
    requirements.push({
      type: 'Rank',
      name: `Rank ${counter.rank}`, // Rank is a number, normalize to readable format
      level: counter.rank, // Store the rank number as level for evaluation
    });
  }

  if (counter.item) {
    requirements.push({
      type: 'Item',
      name: counter.item,
    });
  }

  return requirements;
}

interface RawExpedition {
  Expedition: string;
  Map: string;
}

interface RawSkill {
  Expedition: string;
  Skill: string;
  Level: string;
}

interface RawStaff {
  Expedition: string;
  StaffType: string;
  Count: string;
}

interface RawEvent {
  ID: string;
  ExpeditionName: string;
  Event: string;
  EventType: string;
  EventSubType: string;
  EventDescription: string;
  EventunlockDescription: string;
  EventunlockSkill: string;
  EventunlockSkillLevel: string;
  EventunlockRank: string;
  EventunlockStat: string;
  EventunlockStatLevel: string;
  EventunlockItem: string;
}

interface RawReward {
  Expedition: string;
  Reward: string;
  RewardType: string;
  RewardSubType: string;
}

export interface LoadedExpeditions {
  expeditions: Expedition[];
  errors: string[];
  warnings: string[];
}

/**
 * Load all expedition data from CSVs
 * Joins: Expeditions + Skills + Staff + Events + Rewards
 * Returns structured Expedition objects ready for use
 */
export async function loadExpeditionsFromCSV(): Promise<LoadedExpeditions> {
  const validator = new DataValidator();
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // 1. Fetch all CSV files
    console.log('📥 Loading CSV files...');
    const [expeditionsCSV, skillsCSV, staffCSV, eventsCSV, rewardsCSV] =
      await Promise.all([
        fetch('/Expeditions.csv').then((r) => r.text()),
        fetch('/ExpeditionSkillRequirementsBaseOnly.csv').then((r) => r.text()),
        fetch('/ExpeditionStaffRequirements.csv').then((r) => r.text()),
        fetch('/ExpeditionEvents.csv').then((r) => r.text()),
        fetch('/ExpeditionRewardTypes.csv').then((r) => r.text()),
      ]);

    // 2. Parse CSVs into arrays
    const expeditionsData = parseCSV(expeditionsCSV) as unknown as RawExpedition[];
    const skillsData = parseCSV(skillsCSV) as unknown as RawSkill[];
    const staffData = parseCSV(staffCSV) as unknown as RawStaff[];
    const eventsData = parseCSV(eventsCSV) as unknown as RawEvent[];
    const rewardsData = parseCSV(rewardsCSV) as unknown as RawReward[];

    console.log(
      `📊 Parsed: ${expeditionsData.length} expeditions, ${skillsData.length} skill rows, ${staffData.length} staff rows, ${eventsData.length} events, ${rewardsData.length} rewards`
    );

    // 3. Validate data
    console.log('🔍 Validating data...');
    skillsData.forEach((row, idx) => {
      validator.validateSkillRequirement(idx + 2, row.Skill, row.Level);
    });
    staffData.forEach((row, idx) => {
      validator.validateStaffRequirement(idx + 2, row.StaffType, row.Count);
    });
    eventsData.forEach((row, idx) => {
      if (row.EventunlockSkill) {
        validator.validateEventCounter(
          row.ExpeditionName,
          idx + 2,
          'Skill',
          row.EventunlockSkill
        );
      }
    });

    validator.printReport();

    if (validator.hasErrors()) {
      throw new Error('Data validation failed. See console for details.');
    }

    // 4. Build expedition map (for easy lookup)
    const expeditionMap = new Map<string, Expedition>();

    expeditionsData.forEach((exp) => {
      expeditionMap.set(exp.Expedition, {
        name: exp.Expedition,
        map: exp.Map,
        skillRequirements: [],
        staffRequirements: [],
        events: [],
        rewards: [],
      });
    });

    // 5. Add skill requirements
    skillsData.forEach((row) => {
      const expedition = expeditionMap.get(row.Expedition);
      if (expedition) {
        expedition.skillRequirements.push({
          skill: row.Skill as Skill,
          level: parseInt(row.Level, 10),
        });
      }
    });

    // 6. Add staff requirements
    staffData.forEach((row) => {
      const expedition = expeditionMap.get(row.Expedition);
      if (expedition) {
        expedition.staffRequirements.push({
          type: row.StaffType as StaffType,
          count: parseInt(row.Count, 10),
        });
      }
    });

    // 7. Add events (keep all for now, filtering happens in UI)
    eventsData.forEach((row) => {
      const expedition = expeditionMap.get(row.ExpeditionName);
      if (expedition) {
        const counter = {
          skill: row.EventunlockSkill || undefined,
          skillLevel: row.EventunlockSkillLevel ? parseInt(row.EventunlockSkillLevel, 10) : undefined,
          rank: row.EventunlockRank ? parseInt(row.EventunlockRank, 10) : undefined,
          stat: row.EventunlockStat || undefined,
          statLevel: row.EventunlockStatLevel ? parseInt(row.EventunlockStatLevel, 10) : undefined,
          item: row.EventunlockItem || undefined,
        };

        expedition.events.push({
          id: parseInt(row.ID, 10),
          name: row.Event,
          type: row.EventType,
          subtype: row.EventSubType,
          description: row.EventDescription,
          unlockDescription: row.EventunlockDescription,
          counter,
          requirements: parseEventRequirements(counter),
        });
      }
    });

    // 8. Add rewards
    rewardsData.forEach((row) => {
      const expedition = expeditionMap.get(row.Expedition);
      if (expedition) {
        expedition.rewards.push({
          name: row.Reward,
          type: row.RewardType,
          subtype: row.RewardSubType,
        });
      }
    });

    // 9. Convert map to array (preserves CSV order due to Map insertion order)
    const expeditions = Array.from(expeditionMap.values());

    console.log(`✅ Loaded ${expeditions.length} expeditions successfully`);

    return { expeditions, errors, warnings };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to load expeditions:', message);
    return {
      expeditions: [],
      errors: [message],
      warnings,
    };
  }
}
