export type StaffType = 
  | 'General Staff'
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
  | 'Security Guard';

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
  skills: Map<Skill, number>; // skill level (1-3)
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

export interface Event {
  id: number;
  name: string;
  type: string;
  subtype: string;
  description: string;
  unlockDescription: string;
  counter: EventCounter;
}

export interface Expedition {
  name: string;
  map: string;
  skillRequirements: SkillRequirement[];
  staffRequirements: StaffRequirement[];
  events: Event[];
  rewards: Reward[];
}

export interface ExpeditionFeasibility {
  expedition: Expedition;
  status: 'possible' | 'partial' | 'impossible';
  missingStaff: string[];
  missingSkills: string[];
}
