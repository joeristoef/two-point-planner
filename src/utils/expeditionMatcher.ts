import { StaffMember, Expedition, ExpeditionFeasibility } from '../types/index';
import { isExpert, STAFF_SUBTYPES } from '../config/gameRules';

// Generate all combinations of size k from array
function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
  } else if (k <= arr.length) {
    const [head, ...tail] = arr;
    for (const combo of combinations(tail, k - 1)) {
      yield [head, ...combo];
    }
    for (const combo of combinations(tail, k)) {
      yield combo;
    }
  }
}

function getAvailableStaffForType(reqType: string, staffByType: Map<string, StaffMember[]>, allStaff: StaffMember[]): StaffMember[] {
  if (reqType === 'ANY Staff') {
    return allStaff;
  } else if (reqType === 'ANY Expert') {
    return allStaff.filter((s) => isExpert(s.type));
  } else {
    // Direct match
    const directMatch = staffByType.get(reqType) || [];
    
    // Also include subtypes if this is a parent type
    const withSubtypes = [...directMatch];
    for (const [staffType, parentType] of Object.entries(STAFF_SUBTYPES)) {
      if (parentType === reqType) {
        const subtypeStaff = staffByType.get(staffType) || [];
        withSubtypes.push(...subtypeStaff);
      }
    }
    
    return withSubtypes;
  }
}

// Calculate total stats for a team
function getTeamTotalStats(team: StaffMember[]): { strength: number; dexterity: number; intelligence: number; luck: number } {
  const totals = { strength: 0, dexterity: 0, intelligence: 0, luck: 0 };
  
  for (const member of team) {
    if (member.stats) {
      totals.strength += member.stats.strength || 0;
      totals.dexterity += member.stats.dexterity || 0;
      totals.intelligence += member.stats.intelligence || 0;
      totals.luck += member.stats.luck || 0;
    }
  }
  
  return totals;
}

// Calculate total level (rank) for a team
function getTeamTotalLevel(team: StaffMember[]): number {
  return team.reduce((sum, member) => sum + (member.level || 1), 0);
}

// Check if a specific requirement can be fulfilled by the chosen team
function canFulfillRequirement(
  requirement: { type: string; name: string; level?: number },
  team: StaffMember[],
  availableItems: Set<string>
): boolean {
  const { type, name, level = 0 } = requirement;

  switch (type) {
    case 'Skill': {
      // Check if any team member has this skill at required level
      return team.some((member) => {
        return (member.skills.get(name as any) || 0) >= level;
      });
    }
    
    case 'Stat': {
      // Check if team's total stat meets requirement
      const teamStats = getTeamTotalStats(team);
      // Map CSV stat abbreviations to property names
      const statMap: Record<string, keyof typeof teamStats> = {
        'INT': 'intelligence',
        'STR': 'strength',
        'DEX': 'dexterity',
        'LUCK': 'luck',
        'intelligence': 'intelligence',
        'strength': 'strength',
        'dexterity': 'dexterity',
        'luck': 'luck',
      };
      const statKey = statMap[name] || (name.toLowerCase() as keyof typeof teamStats);
      return (teamStats[statKey] || 0) >= level;
    }
    
    case 'Rank': {
      // Check if team's total level meets requirement
      const teamTotalLevel = getTeamTotalLevel(team);
      return teamTotalLevel >= level;
    }
    
    case 'Item': {
      // Check if item is in available items filter
      return availableItems.has(name);
    }
    
    default:
      return false;
  }
}

// Find the best staff composition that maximizes event satisfaction
function findBestStaffComposition(
  expedition: Expedition,
  staffByType: Map<string, StaffMember[]>,
  allStaff: StaffMember[],
  availableItems: Set<string>
): StaffMember[] | null {
  const requirements = expedition.staffRequirements;
  const skillRequirements = expedition.skillRequirements;

  // Generate all possible assignments for each requirement type
  const possibleAssignmentsPerRequirement: StaffMember[][][] = [];

  for (const req of requirements) {
    const availableStaff = getAvailableStaffForType(req.type, staffByType, allStaff);
    const combosForThisReq: StaffMember[][] = Array.from(combinations(availableStaff, req.count));
    
    if (combosForThisReq.length === 0) {
      return null; // Can't fulfill this requirement at all
    }
    
    possibleAssignmentsPerRequirement.push(combosForThisReq);
  }

  let bestTeam: StaffMember[] | null = null;
  let bestEventCount = -1;

  // Try all combinations of assignments (cartesian product)
  function tryCartesianProduct(
    assignmentOptions: StaffMember[][][],
    currentIndex: number,
    currentAssignment: StaffMember[]
  ): void {
    if (currentIndex === assignmentOptions.length) {
      // Check if this complete assignment satisfies all base skill requirements
      for (const skillReq of skillRequirements) {
        const isSatisfied = currentAssignment.some((member) => {
          return (member.skills.get(skillReq.skill) || 0) >= skillReq.level;
        });
        if (!isSatisfied) {
          return; // This team doesn't meet base requirements
        }
      }

      // Count how many events this team can satisfy
      let satisfiedEventCount = 0;
      for (const event of expedition.events) {
        let canSatisfyEvent = true;
        for (const req of event.requirements) {
          if (!canFulfillRequirement(req, currentAssignment, availableItems)) {
            canSatisfyEvent = false;
            break;
          }
        }
        if (canSatisfyEvent) {
          satisfiedEventCount++;
        }
      }

      // Update best team if this one is better
      if (satisfiedEventCount > bestEventCount) {
        bestEventCount = satisfiedEventCount;
        bestTeam = [...currentAssignment];
      }

      return;
    }

    // Try each combination for the current requirement
    for (const combo of assignmentOptions[currentIndex]) {
      tryCartesianProduct(assignmentOptions, currentIndex + 1, [...currentAssignment, ...combo]);
    }
  }

  tryCartesianProduct(possibleAssignmentsPerRequirement, 0, []);
  return bestTeam;
}

export function canFulfillExpedition(
  staff: StaffMember[],
  expedition: Expedition,
  availableItems: Set<string> = new Set()
): ExpeditionFeasibility {
  const missingStaff: string[] = [];
  const missingSkills: string[] = [];

  // Group staff by type
  const staffByType = new Map<string, StaffMember[]>();
  for (const member of staff) {
    if (!staffByType.has(member.type)) {
      staffByType.set(member.type, []);
    }
    staffByType.get(member.type)!.push(member);
  }

  // Find the best staff composition for this expedition
  const chosenTeam = findBestStaffComposition(expedition, staffByType, staff, availableItems);

  if (!chosenTeam) {
    // Determine what's missing
    // First check staff requirements
    for (const req of expedition.staffRequirements) {
      const available = getAvailableStaffForType(req.type, staffByType, staff);
      if (available.length < req.count) {
        missingStaff.push(`${req.count} ${req.type} (have ${available.length})`);
      }
    }

    // Then check skills
    for (const skillReq of expedition.skillRequirements) {
      const satisfied = staff.some((member) => {
        return (member.skills.get(skillReq.skill) || 0) >= skillReq.level;
      });
      if (!satisfied) {
        missingSkills.push(`${skillReq.skill} (level ${skillReq.level})`);
      }
    }

    const status =
      missingStaff.length === 0 && missingSkills.length === 0
        ? 'partial'
        : missingStaff.length === 0 || missingSkills.length === 0
          ? 'partial'
          : 'impossible';

    return {
      expedition,
      status,
      missingStaff,
      missingSkills,
      chosenTeam: [],
    };
  }

  // Check how many events can be satisfied by the chosen team
  let satisfiedEventCount = 0;
  let partialEventCount = 0;

  for (const event of expedition.events) {
    let eventFullySatisfied = true;
    for (const req of event.requirements) {
      if (!canFulfillRequirement(req, chosenTeam, availableItems)) {
        eventFullySatisfied = false;
        break;
      }
    }
    if (eventFullySatisfied) {
      satisfiedEventCount++;
    } else {
      partialEventCount++;
    }
  }

  // Determine status based on event satisfaction
  const totalEvents = expedition.events.length;
  if (satisfiedEventCount === totalEvents) {
    return {
      expedition,
      status: 'possible',
      missingStaff: [],
      missingSkills: [],
      chosenTeam,
    };
  } else if (satisfiedEventCount > 0 || partialEventCount > 0) {
    return {
      expedition,
      status: 'partial',
      missingStaff: [],
      missingSkills: [],
      chosenTeam,
    };
  } else {
    return {
      expedition,
      status: 'impossible',
      missingStaff: [],
      missingSkills: [],
      chosenTeam,
    };
  }
}

export function checkAllExpeditions(
  staff: StaffMember[],
  expeditions: Expedition[],
  availableItems: Set<string> = new Set()
): ExpeditionFeasibility[] {
  return expeditions.map((exp) => canFulfillExpedition(staff, exp, availableItems));
}
