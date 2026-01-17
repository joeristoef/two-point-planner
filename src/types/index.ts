export type StaffType = 
  | 'Prehistory Expert'
  | 'Botany Expert'
  | 'Fantasy Expert'
  | 'Marine Life Expert'
  | 'Wildlife Expert'
  | 'Digital Expert'
  | 'Supernatural Expert'
  | 'Science Expert'
  | 'Space Expert'
  | 'Assistant'
  | 'Janitor'
  | 'Security Guard'
  | 'Barbarian'
  | 'Bard'
  | 'Rogue'
  | 'Wizard';

export type Skill =
  | 'Aerodynamics'
  | 'Happy Thoughts'
  | 'Pilot Wings'
  | 'Analysis'
  | 'Rapid Restoration'
  | 'Survey Skills'
  | 'Survival Skills'
  | 'Tour Guidelines'
  | 'Animal Analysis'
  | 'Macro-Zoology'
  | 'Micro-Zoology'
  | 'Button Master'
  | 'Fish Whispering'
  | 'Potion Master'
  | 'Spirit Whispering'
  | 'Accomplished Admission'
  | 'Customer Service'
  | 'Marketing'
  | 'Fire-Resistance'
  | 'Ghost Capture'
  | 'Mechanics'
  | 'Workshop'
  | 'Camera Room'
  | 'Strolling Surveillance';

export interface StaffMember {
  id: string;
  name: string;
  type: StaffType;
  level: number; // staff member level (1-20)
  skills: Map<Skill, number>; // skill level (1-3)
  stats?: {
    strength: number;
    dexterity: number;
    intelligence: number;
    luck: number;
  };
}

export interface SkillRequirement {
  skill: Skill;
  level: number;
}

export interface StaffRequirement {
  type: string; // "ANY Staff", "ANY Expert", "Prehistory Expert", etc.
  count: number;
}

export interface Reward {
  name: string;
  type: string;
  subtype: string;
}

export interface EventCounter {
  skill?: string;
  skillLevel?: number;
  rank?: number;
  stat?: string;
  statLevel?: number;
  item?: string;
}

export interface Requirement {
  type: 'Skill' | 'Stat' | 'Rank' | 'Item';
  name: string;
  level?: number; // For Skill, Stat, and Rank types
}

export interface Event {
  id: number;
  name: string;
  type: string;
  subtype: string;
  description: string;
  unlockDescription: string;
  counter: EventCounter;
  requirements: Requirement[]; // Normalized requirements parsed from counter
}

export interface Expedition {
  name: string;
  map: string;
  skillRequirements: SkillRequirement[];
  staffRequirements: StaffRequirement[];
  events: Event[];
  rewards: Reward[];
}

export interface AccumulatedRequirements {
  skills: Array<{ name: string; level: number }>;
  items: Array<{ name: string }>;
  ranks: Array<{ name: string; level: number }>;
  stats: Array<{ name: string; level: number }>;
}

export interface ExpeditionFeasibility {
  expedition: Expedition;
  status: 'possible' | 'partial' | 'impossible';
  missingStaff: string[];
  missingSkills: string[];
  chosenTeam: StaffMember[]; // Staff composition chosen for this expedition
}
