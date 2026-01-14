# Event Filtering Implementation Plan

## Goal
Allow users to select specific event types and subtypes in the filtering menu. The matcher should only calculate requirements needed to handle those selected events, rather than the current "lump sum" that handles all events.

---

## Current Architecture Overview

**Today's flow:**
1. Users create staff and assign skills
2. Each expedition has hardcoded `skillRequirements` + `staffRequirements` (lump sum to handle ALL events)
3. Matcher checks if staff can fulfill those requirements → returns possible/partial/impossible
4. Events CSV exists but is completely unused

---

## Proposed Architecture

**After changes:**
1. Users create staff and assign skills
2. Users select which event **types** and **subtypes** they care about (UI addition)
3. System dynamically calculates the **actual requirements needed** to handle only those selected events
4. Matcher uses the filtered requirements instead of hardcoded ones

---

## Step-by-Step Implementation Breakdown

### Step 1: Data Structure Changes (Types)

**File to modify:** `src/types/index.ts`

**What needs to be added:**
- New `Event` interface:
  ```typescript
  export interface Event {
    id: number;
    expeditionName: string;
    eventType: 'Positive' | 'Negative' | 'Injury' | 'Illness' | 'MIA' | 'Curse';
    eventSubType: string;
    eventDescription: string;
    requirements: {
      skills?: { skill: Skill; level: number }[];
      rank?: number;
      items?: string[];
    };
  }
  ```

- Update `Expedition` interface to include:
  ```typescript
  events?: Event[];  // Events that can occur on this expedition
  eventRequirements?: Map<string, SkillRequirement | StaffRequirement>;  // All possible requirements across all events
  ```

- New filter state type:
  ```typescript
  export interface EventFilter {
    eventTypes: Set<'Positive' | 'Negative' | 'Injury' | 'Illness' | 'MIA' | 'Curse'>;
    eventSubtypes: Set<string>;
  }
  ```

**Impact:** ✅ Non-breaking - Just adding new optional fields

---

### Step 2: CSV Parser for Events

**File to create:** `src/data/loadEvents.ts`

**What needs to be created:**
- Similar structure to `loadRewards.ts`
- Parses ExpeditionEvents.csv
- Returns a Map<expeditionName, Event[]>
- Converts "Positive", "Negative", etc. to enum-like values
- Maps unlock conditions (skills, rank, items) into a normalized structure

**Function signature:**
```typescript
export async function parseEventsCsv(): Promise<Map<string, Event[]>>
```

**Impact:** ✅ Non-breaking - Completely new module, no existing code touched

---

### Step 3: Event Data Integration

**File to modify:** `src/App.tsx`

**What needs to be modified:**
- In the useEffect that loads expeditions, add:
  ```typescript
  const eventsMap = await parseEventsCsv();
  const expeditionsWithEvents = expeditionsBase.map(exp => ({
    ...exp,
    events: eventsMap.get(exp.name) || []
  }));
  ```

**Impact:** ✅ Non-breaking - Just adds data to existing expedition objects, no logic changes

---

### Step 4: Event Filter UI

**Files to modify:** UI components (likely where filter controls are)

**What needs to be added:**
- New component or extend filters section in the UI
  - Checkboxes for event types (Positive, Negative, Injury, Illness, MIA, Curse)
  - Collapsible list of event subtypes (e.g., "+XP", "Helicopter Damage", "MIA", etc.)
  - Default: All types selected (current behavior)

- State management in `App.tsx`:
  ```typescript
  const [selectedEventFilters, setSelectedEventFilters] = useState<EventFilter>({
    eventTypes: new Set(['Positive', 'Negative', 'Injury', 'Illness', 'MIA', 'Curse']),
    eventSubtypes: new Set() // Empty = all subtypes
  });
  ```

**Impact:** ✅ Non-breaking - Purely additive UI, default state = current behavior

---

### Step 5: Dynamic Requirement Calculator

**File to create:** `src/utils/eventRequirementCalculator.ts`

**Function signature:**
```typescript
export function calculateRequiredSkillsForEvents(
  expedition: Expedition,
  eventFilters: EventFilter
): {
  skillRequirements: SkillRequirement[];
  staffRequirements: StaffRequirement[];
}
```

**Logic:**
1. Filter expedition.events by selected event types & subtypes
2. Extract all unlock conditions from those filtered events
3. "Collapse" overlapping requirements (if multiple events need "Survival Skills Level 1", only require it once)
4. Return final skill/staff requirements

**Example scenario:**
- User selects: Only "MIA" events
- Expedition "Frosted Tops" has events:
  - Avalanche (MIA - needs Pilot Wings L1)
  - Blizzard (Injury - needs Rank 8)
- Result: Only requires Pilot Wings L1 (Blizzard requirement dropped)
- Current hardcoded: Requires Pilot Wings L2 + Survey Skills L1 + Prehistory Expert + rank 12

**Impact:** ✅ Non-breaking - New utility, doesn't affect existing code

---

### Step 6: Matcher Integration

**File to modify:** `src/utils/expeditionMatcher.ts`

**What needs to be modified:**
- Modify `canFulfillExpedition()` function signature:
  ```typescript
  export function canFulfillExpedition(
    staff: StaffMember[],
    expedition: Expedition,
    eventFilters?: EventFilter  // NEW OPTIONAL PARAMETER
  ): ExpeditionFeasibility
  ```

- Add logic:
  ```typescript
  // Use calculated requirements if filters provided
  const relevantReqs = eventFilters 
    ? calculateRequiredSkillsForEvents(expedition, eventFilters)
    : {
        skillRequirements: expedition.skillRequirements,
        staffRequirements: expedition.staffRequirements
      };
  
  // Rest of logic stays exactly the same, but use relevantReqs instead of expedition.skillRequirements/staffRequirements
  ```

- Update `checkAllExpeditions()` to pass eventFilters to `canFulfillExpedition()`

**Impact:** ✅ **MOSTLY non-breaking** - New optional parameter with sensible default (undefined = use hardcoded, which is current behavior)

---

### Step 7: Hook It All Together

**File to modify:** `src/App.tsx`

**In the checkAllExpeditions call:**
```typescript
const results = checkAllExpeditions(staff, expeditions, selectedEventFilters);
```

**Impact:** ✅ Non-breaking - Existing code without filters still works

---

## Will This Break Current Logic?

**Answer: NO, if implemented correctly.**

**Why:**
1. All new code is additive (new files, new optional parameters)
2. Default behavior when all filters selected = closest to current "lump sum"
3. The matcher algorithm itself doesn't change, just the input data
4. Hardcoded requirements remain untouched (fallback if events aren't loaded)

**Key safeguard:**
- If `eventFilters` is undefined → use hardcoded requirements (current behavior)
- If `eventFilters` is defined → use calculated requirements

---

## How It Works Afterward

1. **User defaults to all event types selected** → Requirements match hardcoded (current behavior)
2. **User unselects "Injury" events** → Requirements drop all Injury unlock conditions
3. **Expeditions dynamically re-evaluate** → Green/yellow/red statuses update in real-time
4. **Missing requirements adjust** → Only show missing skills needed for selected events

---

## Implementation Order (Recommended)

1. Step 1: Add types to `src/types/index.ts`
2. Step 2: Create `src/data/loadEvents.ts` parser
3. Step 3: Integrate events into expeditions in `src/App.tsx`
4. Step 5: Create `src/utils/eventRequirementCalculator.ts`
5. Step 6: Update matcher in `src/utils/expeditionMatcher.ts`
6. Step 7: Update App.tsx to pass filters to matcher
7. Step 4: Add UI for event filtering (last, so you can see what event types/subtypes are available)

---

## Potential Edge Cases to Handle

| Case | Solution |
|------|----------|
| Event has multiple unlock methods (e.g., "Rank 10 OR Survival Skills 1") | Store as alternatives, user must meet ANY one |
| Circular dependencies in unlock logic | Flag these in data, warn users |
| Events without explicit requirements | Treat as "always possible" |
| User selects no event types | Could show "no requirements" or alert |
| Rank-based requirements | Need to determine what "Rank" means in context and how to represent it |

---

## Notes on ExpeditionEvents.csv Structure

The CSV has these columns:
- **ID**: Unique event identifier
- **ExpeditionName**: Which expedition the event occurs on
- **Event**: Event name
- **EventType**: 'Positive', 'Negative', 'Injury', 'Illness', 'MIA', or 'Curse'
- **EventSubType**: Further categorization (e.g., '+XP', 'Helicopter Damage', empty for some)
- **EventDescription**: What the event does
- **EventunlockDescription**: How to counter/unlock it
- **EventunlockSkill**: Skill needed (if any)
- **EventunlockSkillLevel**: Skill level required
- **EventunlockRank**: Staff rank needed (if any)
- **EventunlockStat**: Other stat requirement
- **EventunlockStatLevel**: Stat level
- **EventunlockItem**: Item needed (if any)

The parser needs to consolidate these into a clean `requirements` object within each Event.

---

## Verdict

✅ **This is absolutely feasible and architecturally sound.**

The matcher stays dumb (just checks if staff meets requirements), and the requirement calculator becomes the smart layer that responds to filters. Current code remains untouched.
