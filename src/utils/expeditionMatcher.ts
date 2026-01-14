import { StaffMember, Expedition, ExpeditionFeasibility } from '../types/index';
import { isExpert } from '../config/gameRules';

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
    return staffByType.get(reqType) || [];
  }
}

// Try all possible combinations of staff assignments to see if any can fulfill the expedition
function tryAllAssignments(
  expedition: Expedition,
  staffByType: Map<string, StaffMember[]>,
  allStaff: StaffMember[]
): boolean {
  const requirements = expedition.staffRequirements;
  const skillRequirements = expedition.skillRequirements;

  // Generate all possible assignments for each requirement type
  const possibleAssignmentsPerRequirement: StaffMember[][][] = [];

  for (const req of requirements) {
    const availableStaff = getAvailableStaffForType(req.type, staffByType, allStaff);
    const combosForThisReq: StaffMember[][] = Array.from(combinations(availableStaff, req.count));
    
    if (combosForThisReq.length === 0) {
      return false; // Can't fulfill this requirement at all
    }
    
    possibleAssignmentsPerRequirement.push(combosForThisReq);
  }

  // Try all combinations of assignments (cartesian product)
  function tryCartesianProduct(
    assignmentOptions: StaffMember[][][],
    currentIndex: number,
    currentAssignment: StaffMember[]
  ): boolean {
    if (currentIndex === assignmentOptions.length) {
      // Check if this complete assignment satisfies all skills
      for (const skillReq of skillRequirements) {
        const isSatisfied = currentAssignment.some((member) => {
          return (member.skills.get(skillReq.skill) || 0) >= skillReq.level;
        });
        if (!isSatisfied) {
          return false;
        }
      }
      return true;
    }

    // Try each combination for the current requirement
    for (const combo of assignmentOptions[currentIndex]) {
      if (tryCartesianProduct(assignmentOptions, currentIndex + 1, [...currentAssignment, ...combo])) {
        return true;
      }
    }

    return false;
  }

  return tryCartesianProduct(possibleAssignmentsPerRequirement, 0, []);
}

export function canFulfillExpedition(
  staff: StaffMember[],
  expedition: Expedition
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

  // Check if there's ANY valid combination of staff that can fulfill this expedition
  const canFulfill = tryAllAssignments(expedition, staffByType, staff);

  if (canFulfill) {
    // Expedition is possible
    return {
      expedition,
      status: 'possible',
      missingStaff: [],
      missingSkills: [],
    };
  }

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
  };
}

export function checkAllExpeditions(
  staff: StaffMember[],
  expeditions: Expedition[]
): ExpeditionFeasibility[] {
  return expeditions.map((exp) => canFulfillExpedition(staff, exp));
}
