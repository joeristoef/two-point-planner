# Event Filtering Phase C & D Strategy Document

**Status:** Planning/Design Phase  
**Created:** January 17, 2026  
**Target Implementation:** Phase 2C & 2D of Event Filtering Feature

---

## Executive Summary

This document outlines the complete strategy for implementing event-based requirement filtering in the Two Point Planner. Users will be able to:
1. Filter expeditions by event types/subtypes
2. See requirement stamps on event icons
3. View accumulated requirements from filtered events
4. See card status (green/red) based on whether filtered requirements can be met
5. Visual indication of event feasibility based on staff roster and event type logic

---

## Current State

**What's Already Implemented:**
- Event display in ExpeditionList.tsx (expanded view)
- Event icons (68x64px with 4px colored border)
- Event type indicators (transparent stamp icons, top-left corner)
- Event color badges by type (Positive, Negative, Injury, Illness, MIA, Curse, Neutral)
- "Counter:" / "Unlock:" labels and "Seasonal:" detection
- Event type icons from `/public/assets/event-type-icons/`
- Reward filtering system (filter by reward types/subtypes)

**What Still Needs to be Done:**
- Requirement stamps on event images (top-right)
- Event type/subtype filtering UI
- Requirement accumulation logic
- Event requirement checking against staff roster
- Card status color logic change (possible/partial/impossible → green/red binary)
- Event greying logic per type category

---

## Requirements Detail (A-F)

### Requirement A: Requirement Stamps on Event Images

**Visual Design:**
- Location: Top-right corner of event image, overhanging (like current type icon)
- Multiple stamps may be required if an event has multiple requirement types
- Stamp size: To be determined, but should follow existing icon styling patterns

**Content Structure per Event:**
Each event in ExpeditionEvents.csv can have requirements in these columns:
- **Skill Requirements:** `[SkillName] [Level]` (e.g., "Pilot Wings 2")
- **Item Requirements:** `[ItemName]` (no level)
- **Rank Requirements:** `[RankName]` (no level)
- **Stat Requirements:** `[StatName] [Level]` (e.g., "Stress 3")

**Display Logic:**
- Extract requirement string from event
- Parse into structured format: `{ type: 'Skill' | 'Item' | 'Rank' | 'Stat', name: string, level?: number }`
- For each requirement, show icon + name with level if applicable
- Follow existing icon styling for skills, items, stats from `/public/assets/`
- Group multiple requirements or stack them spatially

**Example:**
Event "Bad Weather" has Skill requirement "Pilot Wings 2" and Stat requirement "Stress 3"
- Show two stamps: one with Pilot Wings icon + "2", one with Stress icon + "3"

---

### Requirement B: Event Type/Subtype Filtering

**Filter UI:**
- Add new filter section in App.tsx (similar to reward filtering)
- Display checkboxes for each event type: Positive, Negative, Injury, Illness, MIA, Curse, Neutral
- Display checkboxes for each subtype found in data
- Style: Same as existing reward filters

**Default State:**
- All event types/subtypes initially checked (show all events)

**Filtering Behavior:**
- User unchecks an event type → events of that type are MARKED as filtered but NOT removed from display
- Filtered events remain visible in expanded view with reduced opacity (e.g., 0.5)
- Filtered events are EXCLUDED from all calculations (accumulation, requirement checking, card status)

**Data Structure:**
```typescript
filterByEventTypes?: Set<string>; // e.g., Set(['Positive', 'Negative'])
filterByEventSubtypes?: Set<string>; // e.g., Set(['subtype1', 'subtype2'])
```

---

### Requirement C: Requirement Accumulation from Filtered Events

**Logic:**
1. For each expedition, iterate through its events
2. Keep only events where (eventType IN filterByEventTypes) AND (eventSubtype IN filterByEventSubtypes)
3. For each kept event, extract its requirements
4. Accumulate all requirements:
   - Group by requirement type (Skill, Item, Rank, Stat)
   - For skills/stats with levels: take the MAXIMUM level required
   - For items/ranks: just list them (no levels)

**Output Structure:**
```typescript
{
  skills: [{ name: 'Pilot Wings', level: 2 }, { name: 'Archaeology', level: 1 }],
  items: [{ name: 'Whip' }, { name: 'Hat' }],
  ranks: [{ name: 'Bronze' }],
  stats: [{ name: 'Stress', level: 3 }]
}
```

**Display in Folded Card:**
- Show these accumulated requirements as icons in the expedition card header (similar to staff type icons)
- Color them based on fulfillment (see Requirement D)

---

### Requirement D: Color Requirements by Fulfillment

**Logic per Requirement Type:**

**Skills:**
- Check if any staff member in roster has `skill >= requiredLevel`
- Green: ✓ Fulfilled
- Red: ✗ Not fulfilled

**Items:**
- Check if any staff member in roster has this item
- Green: ✓ Fulfilled
- Red: ✗ Not fulfilled

**Ranks:**
- Check if any staff member in roster has this rank
- Green: ✓ Fulfilled
- Red: ✗ Not fulfilled

**Stats:**
- Check if any staff member in roster has `stat >= requiredLevel`
- Green: ✓ Fulfilled
- Red: ✗ Not fulfilled

**Visual Implementation:**
- Green icon = fulfilled (normal color)
- Red icon = not fulfilled (desaturated/greyed out or red tint)

---

### Requirement E: Grey Out Events Based on Type Category Logic

**Core Logic:**

**For Positive/Neutral Events:**
- These events CAN occur when player HAS the required skills
- If player HAS all requirements → Event is active/visible (in color)
- If player DOES NOT have all requirements → Event is greyed out (opacity 0.5)

**For All Other Events (Negative, Injury, Illness, MIA, Curse):**
- These events CAN occur when player DOES NOT have the required skills
- If player DOES NOT have all requirements → Event is active/visible (in color)
- If player DOES have all requirements → Event is greyed out (opacity 0.5)

**Requirements Check:**
For each event, check if player can fulfill ALL of that event's requirements using current staff roster.

**Visual Implementation:**
```css
opacity: (event is feasible for this type) ? 1 : 0.5;
```

---

### Requirement F: Card Status Color (Binary: Green/Red)

**New Status Logic:**
Replace the existing three-state system (possible/partial/impossible) with binary:
- **Green:** "All Requirements Met" - Player can fulfill ALL accumulated requirements from filtered events
- **Red:** "Not All Requirements Met" - Player cannot fulfill at least one accumulated requirement

**Determination:**
1. Apply filters to get only included events
2. Accumulate requirements from those events
3. Check if player roster can fulfill every accumulated requirement
4. If ALL fulfilled → Green
5. If ANY unfulfilled → Red

**Card Border/Background:**
- Green: `#51cf66` border (existing possible color)
- Red: `#ff8787` border (existing impossible color)

---

## Implementation Strategy (6 Steps)

### Step 1: Data Layer - Verify Event Requirements Parsing

**Goal:** Ensure event requirements are correctly parsed from ExpeditionEvents.csv into the Event data structure.

**Actions:**
- Check `/src/data/loadExpeditions.ts` to see how events are loaded
- Verify that Skill, Item, Rank, and Stat requirement columns are being extracted
- Create utility function in `/src/utils/` called `parseEventRequirement(requirementString: string): Requirement`
- Output structure:
  ```typescript
  interface Requirement {
    type: 'Skill' | 'Item' | 'Rank' | 'Stat';
    name: string;
    level?: number; // Only for Skill and Stat types
  }
  ```
- Create unit tests to verify parsing works correctly
- Example: "Pilot Wings 2" → `{ type: 'Skill', name: 'Pilot Wings', level: 2 }`

**Success Criteria:**
- All event requirement columns are being read from CSV
- Requirement parsing function handles all four types
- Test cases pass for various requirement formats

---

### Step 2: Filter System - Event Type/Subtype UI

**Goal:** Add event filtering controls to the UI, similar to reward filtering.

**Actions:**
- Add new state to `App.tsx`:
  ```typescript
  const [filterByEventTypes, setFilterByEventTypes] = useState<Set<string>>(new Set());
  const [filterByEventSubtypes, setFilterByEventSubtypes] = useState<Set<string>>(new Set());
  ```
- Extract all unique event types and subtypes from loaded expeditions
- Create new filter component `<EventTypeFilter>` (or add to existing filter section)
- Render checkboxes for each type and subtype
- Pass these filters down to `<ExpeditionList>` component
- Update `ExpeditionList` props:
  ```typescript
  filterByEventTypes?: Set<string>;
  filterByEventSubtypes?: Set<string>;
  ```

**Visual Placement:**
- Add to the right side of the UI with other filters (rewards, maps, statuses)

**Success Criteria:**
- User can check/uncheck event types
- User can check/uncheck event subtypes
- Filters are passed to ExpeditionList without breaking existing functionality
- Default: all types/subtypes checked (show everything)

---

### Step 3: Requirement Stamps - Add to Event Images

**Goal:** Display requirement information as visual stamps on the top-right of event images.

**Actions:**
- In `ExpeditionList.tsx`, locate the event image rendering section
- Create new div container with `position: relative` (already done for type icon)
- For each event requirement, add an overlay stamp
- Position stamps in top-right corner (mirror of type icon position on top-left)
- If multiple requirements, stack them vertically or horizontally (TBD layout)
- Use existing icon utilities to fetch requirement icons
- Display level number if applicable (similar to skill icons in folded view)

**Requirements Stamp Structure:**
- Icon image (28x28px or TBD size)
- Optional level/number badge (for skills and stats)
- Transparent background (no border/background like type icon)
- Positioned at `top: -4px, right: -4px` to overhang

**Example JSX:**
```tsx
{event.requirements.map((req, idx) => (
  <img
    src={getRequirementIcon(req)}
    alt={req.name}
    style={{ position: 'absolute', top: `-4px`, right: `${-4 - (idx * 28)}px`, width: '28px', height: '28px' }}
  />
))}
```

**Success Criteria:**
- Requirement stamps render on correct corner
- Icons are correctly resolved and display
- Level numbers show for skills/stats
- Multiple requirements don't overlap badly

---

### Step 4: Requirement Accumulation - Calculate Total Needs

**Goal:** Extract and accumulate requirements from only filtered events.

**Actions:**
- Create utility function `accumulateRequirements(events: Event[], filtered: Set<string>): AccumulatedRequirements`
- Logic:
  1. Filter events based on active filters
  2. Extract requirements from each event
  3. Group by type
  4. For skills/stats, take max level
  5. Return aggregated structure
- Create type:
  ```typescript
  interface AccumulatedRequirements {
    skills: Array<{ name: string; level: number }>;
    items: Array<{ name: string }>;
    ranks: Array<{ name: string }>;
    stats: Array<{ name: string; level: number }>;
  }
  ```
- Call this function for each expedition before calculating status

**Success Criteria:**
- Accumulation only includes events passing filters
- Multiple events with same requirement → max level taken
- Return structure is clean and usable for downstream functions

---

### Step 5: Requirement Checking - Validate Against Staff Roster

**Goal:** Determine if current staff roster can fulfill each accumulated requirement.

**Actions:**
- Create utility function `canFulfillRequirements(accumulated: AccumulatedRequirements, staff: Staff[]): RequirementStatus`
- Return detailed status:
  ```typescript
  interface RequirementStatus {
    allMet: boolean; // All requirements fulfilled?
    skills: Map<string, boolean>; // Per-skill fulfillment
    items: Map<string, boolean>;
    ranks: Map<string, boolean>;
    stats: Map<string, boolean>;
  }
  ```
- Logic for each requirement type:
  - **Skill:** Find any staff with skill level >= required
  - **Item:** Find any staff with this item
  - **Rank:** Find any staff with this rank
  - **Stat:** Find any staff with stat >= required
- Implement event greying logic in this function (or separate)

**Success Criteria:**
- Function correctly checks roster against requirements
- Returns detailed fulfillment status per requirement
- Can be used for coloring both requirement stamps and events

---

### Step 6: Card Status Color - Binary Green/Red System

**Goal:** Replace three-state status system with binary green/red based on filtered requirements.

**Actions:**
- Update status calculation in `expeditionMatcher.ts` (or wherever feasibility is calculated)
- Old logic (for reference):
  ```typescript
  if (allSkillsMet && allStaffMet) status = 'possible';
  else if (someSkillsMet || someStaffMet) status = 'partial';
  else status = 'impossible';
  ```
- New logic:
  ```typescript
  const accumulated = accumulateRequirements(expedition.events, activeFilters);
  const requirement = canFulfillRequirements(accumulated, staff);
  return requirement.allMet ? 'green' : 'red';
  ```
- Update color mapping in `ExpeditionList.tsx`:
  ```typescript
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'green': return '#51cf66';
      case 'red': return '#ff8787';
      default: return '#dee2e6';
    }
  };
  ```

**Considerations:**
- Expedition still shows all events (filtered events just don't affect status)
- Status updates reactively as filters change
- Staff roster changes update status immediately

**Success Criteria:**
- Card border turns green when requirements met
- Card border turns red when requirements not met
- Status updates when filters change
- Status updates when staff roster changes

---

## Data Flow Diagram

```
User Changes Filters
        ↓
App.tsx updates filterByEventTypes/filterByEventSubtypes state
        ↓
Pass filters to ExpeditionList
        ↓
For each expedition:
  1. accumulateRequirements(expedition.events, filters)
  2. canFulfillRequirements(accumulated, staffRoster)
  3. Determine card status (green/red)
  4. Determine event visibility/opacity
  5. Render with new status
        ↓
UI updates with new card colors and event visibility
```

---

## Visual Examples

### Example 1: Single Event with Requirements

**Event:** "Monsoon Season"
- Type: Negative
- Requirements: Pilot Wings 2, Stress 3
- Display:
  - Event image (64x64px)
  - Type icon stamp (top-left): "Negative" icon
  - Requirement stamps (top-right): "Pilot Wings 2" icon + "Stress 3" icon

### Example 2: Expedition Card with Accumulated Requirements

**Expedition:** "Monsoon Expedition"
- Events:
  - "Monsoon Season" (Negative): Pilot Wings 2, Stress 3
  - "Wind Gust" (Negative): Pilot Wings 1
  - "Safe Haven" (Positive): Swimming 1 [FILTERED OUT by user]

**After Filtering (excluding Positive):**
- Accumulated: Pilot Wings 2, Stress 3
- Staff has: Pilot Wings 1, Stress 2
- Card Status: RED (Pilot Wings requirement not met, Stress requirement not met)
- Negative events visible in color
- Positive event visible in folded view but greyed out

---

## Implementation Order

**Phase 2C (Event Requirements Display):**
1. ✓ Step 1: Verify event data parsing
2. → Step 2: Add filter UI
3. → Step 3: Add requirement stamps to events
4. → Step 4: Accumulate requirements function

**Phase 2D (Event Filtering Logic):**
5. → Step 5: Check requirements against roster
6. → Step 6: Card status color system

---

## Notes & Considerations

- **Backwards Compatibility:** Existing feasibility calculations should still work for expeditions without events
- **Performance:** Accumulation and checking should be memoized for large rosters
- **Edge Cases:**
  - Events with no requirements (should not show stamps)
  - Expeditions with no events (should show old status? or green by default?)
  - Filtered events that result in zero accumulated requirements
- **Future Enhancement:** Allow users to set "Required Event Types" vs "Acceptable Event Types" for more granular control

---

## Success Criteria (Overall)

✅ Users can filter by event type/subtype  
✅ Requirement stamps display on event images  
✅ Accumulated requirements visible in card header  
✅ Requirements colored green/red by fulfillment  
✅ Events greyed out appropriately by type category  
✅ Card shows binary green/red status  
✅ All changes reactive to filter/roster updates  
✅ Existing tests still pass  

---

**Document Version:** 1.0  
**Last Updated:** January 17, 2026  
**Next Review:** When implementation begins
