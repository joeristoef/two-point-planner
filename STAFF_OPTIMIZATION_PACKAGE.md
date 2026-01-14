# Staff Optimization Package

## Overview

The Staff Optimization Package is a comprehensive system designed to help users plan optimal staff rosters for Two Point Hospital expeditions. It goes beyond simple feasibility checking to provide smart, configurable optimization that respects both game mechanics and user preferences.

---

## Core Problem Statement

**The Gap:** Current system shows which expeditions are feasible with current staff, but doesn't help users:
- Plan rosters from scratch efficiently
- Understand which expeditions force specific training paths
- Balance hiring new staff vs. training existing staff
- Allocate skills intelligently based on game utility
- Make informed choices about training effort vs. coverage

**Why It Matters:**
- Training staff to 5 slots is exponentially more expensive than training to 3 slots
- Hiring new 3-slot staff is often easier than pushing existing staff from 3→4 slots
- Some skills have high non-expedition utility (e.g., Aerodynamics on Security Guards)
- Other skills are situational and wasteful on high-demand staff (e.g., Happy Thoughts on Experts)
- Expeditions have different "flexibility" based on skill exclusivity and slot requirements

---

## Key Insights

### 1. Slot Exhaustion System

**How it works:**
- Each staff member has 5 skill slots
- Each skill level takes 1 slot (Survival Skills L2 = 2 slots, L1 = 1 slot)
- Staff type has maximum 5 slots total

**Example - Darkest Depths:**
```
Marine Life Expert:
  - Fish Whispering L2 = 2 slots
  - Survival Skills L2 = 2 slots
  - Survey Skills L1 = 1 slot
  = 5/5 slots (LOCKED - no flexibility)

Security Guard:
  - Pilot Wings L2 = 2 slots
  = 2/5 slots (flexible, 3 free)
```

**Impact:** Some expeditions force specific staff to be "locked" at 5 slots with no remaining capacity.

### 2. Exclusive Skills Force Composition

**Definition:** Skills that only one staff type can learn.

**Example:** Fish Whispering is exclusive to Marine Life Experts
- If an expedition requires Fish Whispering L2 + other exclusive skills
- AND those exclusive skills total 5+ slots
- Then that staff type is FORCED to be completely filled by this expedition alone

**Consequence:** These "forced locked" expeditions cannot be optimized away. They must be trained exactly as required.

### 3. Training Effort Curve

Not all staff are equally easy to train:

```
Training Cost:
  0→1 slot: LOW
  1→2 slots: LOW
  2→3 slots: LOW
  3→4 slots: MEDIUM (spike!)
  4→5 slots: HIGH (steep spike!)
```

**Decision Point:** Is it better to:
- Option A: Train 1 person from 3→5 slots (hard)
- Option B: Hire 1 new person and train both to 3 slots (easier)

Often Option B is better, but not always.

### 4. Non-Expedition Utility of Skills

Some skills have value outside expeditions:

**High Utility Skills:**
- **Aerodynamics** on Security Guards: Critical for helicopter incidents
- **Pilot Wings** on various types: Useful for helicopters/planes in normal operations
- **Fire-Resistance** on Janitors: Useful for dangerous areas

**Low/Situational Utility Skills:**
- **Happy Thoughts**: Only really needed in Netherworld expeditions (situational)
- **Ghost Capture**: Only useful if you have ghost incidents
- **Fish Whispering**: Exclusive to Marine Life Experts, expedition-only

**Implication:** Putting Happy Thoughts on a Prehistory Expert (who needs slots for Survival/Survey Skills) is wasteful. Better to put it on a Janitor who has spare slots.

### 5. Flexibility Score

Not all expeditions are equally rigid:

- **Locked (0% flexibility):** All skills map 1-to-1 to mandatory events, slots completely full
- **Tight (0-30% flexibility):** Some shared skills, some extra slots available
- **Moderate (30-70% flexibility):** Multiple alternative paths, room for optimization
- **Flexible (70%+ flexibility):** Few required skills, lots of options

---

## The Optimizer Component

### Purpose
Suggest optimal staff rosters for user-selected goals, respecting:
- User-defined constraints
- Game mechanics (skill exclusivity, slot limits)
- Training effort realities
- Non-expedition skill utility

### How It Works

**Input:**
1. Target expeditions (e.g., all 166 for Everything Museum)
2. User preferences (optimization goal, constraints)
3. Current staff (if any)
4. Risk tolerance (event filtering preferences)

**Process:**
1. Analyze all expeditions for locked/flexible compositions
2. Identify forced training paths
3. Allocate skills strategically based on preferences
4. Generate multiple solutions with different trade-offs
5. Present ranked options to user

**Output:**
- Recommended roster(s)
- Staff breakdown (3-slot, 4-slot, 5-slot)
- Training effort estimates
- Reasoning/explanations
- Alternative solutions

---

## Optimizer Modes (Presets)

### Perfectionist
```
Goal: Cover everything
Constraint: Any training burden acceptable
Strategy: Minimize staff count
Result: Fewest people, some pushed to 5 slots
Use case: "I'll do whatever it takes"
```

### Pragmatist (Recommended Default)
```
Goal: Balance staff count and training effort
Constraint: Prefer 4-slot limit, smart skill allocation
Strategy: Respect non-expedition utility, avoid expert slot waste
Result: Slightly more staff, much smarter allocation
Use case: "I want efficient, sensible rosters"
```

### Efficient
```
Goal: Minimize training effort
Constraint: Prefer 3-slot staff
Strategy: Hire more at 3 slots vs. pushing to 4-5
Result: More staff, but each easier to train
Use case: "Training is my bottleneck"
```

### Minimalist
```
Goal: Fewest staff at lowest effort
Constraint: Hard limit on both
Strategy: No luxury skills, no padding
Result: Bare minimum
Use case: "I want the leanest possible roster"
```

### Custom
User configures all options manually.

---

## Optimizer Preferences (Configurable)

```typescript
// Optimization goal
optimizeFor: 'minStaff' | 'minTrainingEffort' | 'minSlots' | 'balanced'

// Hard constraints
maxStaffCount?: number
maxSlots?: number
maxSlotsPerStaff?: number

// Strategy toggles
respectNonExpeditionUtility: boolean  // Put Aerodynamics on Security Guards?
avoidWasteOnExperts: boolean          // Avoid Happy Thoughts on Experts?
prioritizeEarlySlots: boolean         // Hire 3-slot staff instead of pushing to 4?

// User's current situation
alreadyHired: StaffType[]
doNotHire: StaffType[]
preferExpediteTraining: boolean

// Event filtering (future)
eventPreferences: { skip MIAs? skip Injuries? }
```

---

## How It Serves Different Users

### User A (Reward Hunter)
**Goal:** Find what staff needed for specific rewards

**Value:** Doesn't use optimizer directly, uses reward filters
- Future: Could show "recommended trainer" for each expedition

### User B (Advanced Planner)
**Goal:** Build roster that covers X rewards efficiently

**Value:** CRITICAL
- Select expeditions they want
- Get recommended roster (Pragmatist preset)
- See training path and effort estimates
- Modify constraints if they want alternatives

### User C (Current Staff Checker)
**Goal:** Identify conflicts in current roster

**Value:** HELPFUL
- Input current staff in "Personal Constraints"
- Optimizer identifies which expeditions conflict
- Shows which to prioritize
- Suggests one additional hire to unlock expeditions

### User D (Everything Museum)
**Goal:** Optimal roster for complete coverage

**Value:** CRITICAL
- Most complex optimization problem
- Needs multiple solution options
- Wants to understand trade-offs
- May use event filtering to reduce scope
- Needs explanations for why certain allocations

---

## Skill Allocation Strategy

### Smart Allocation Rules (Priority Order)

1. **Exclusive skills MUST go on their designated type**
   - Example: Fish Whispering → Marine Life Expert only

2. **Situational low-value skills on cheap staff**
   - Example: Happy Thoughts (Netherworld only) → Janitor/Assistant, NOT Expert
   - Frees Expert slots for high-demand expedition skills

3. **High-utility non-expedition skills on ideal staff types**
   - Example: Aerodynamics → Security Guard first, then Janitor
   - Provides real game value outside expeditions

4. **Fill Expert slots with high-demand expedition skills**
   - Example: Survival Skills, Survey Skills on Experts
   - Experts are scarce, use for high-leverage skills

5. **Avoid pushing slot-constrained staff over 3 unless necessary**
   - Example: Hire new 3-slot staff instead of pushing existing to 4-5
   - Respects training effort curve

### Example: Netherworld Expeditions

**Naive approach:**
```
Marine Life Expert: Fish Whispering L2 + Survival L2 + Happy Thoughts L2
Result: 5 slots used, none left for other expeditions
```

**Smart approach:**
```
Marine Life Expert: Fish Whispering L2 + Survival L2 (3 slots, reusable)
Janitor: Happy Thoughts L2 + Ghost Capture L1 + Fire-Resistance L1 (4 slots)
Result: Marine Life Expert stays flexible, Janitor gets natural fit skill
```

---

## Multiple Solutions with Trade-offs

Optimizer presents ranked alternatives:

```
Solution 1: Fewest Staff (14 staff, 45 total slots)
  - 2 at 3-slots
  - 5 at 4-slots
  - 7 at 5-slots ← High training burden
  Trade-off: Minimal hiring, heavy training

Solution 2: Balanced (16 staff, 50 total slots)
  - 8 at 3-slots
  - 5 at 4-slots
  - 3 at 5-slots ← Better distribution
  Trade-off: 2 more people, much easier to train

Solution 3: Minimal Risk + Event Filtering (11 staff, 32 slots)
  - Coverage: 140/166 expeditions (skip MIAs)
  Trade-off: Not perfect coverage, significantly easier
```

User chooses which trade-off matches their goals.

---

## Event Filtering Integration (Future)

When event filtering is implemented, optimizer can show:

```
"If you're willing to accept risks on certain events:"
  - Skip MIA events → 11 staff needed (vs. 14)
  - Skip Injury events → 10 staff needed
  - Skip both → 8 staff needed (risky!)
```

Users can see the cost/benefit of each risk tolerance level.

---

## User Agency & Customization

**Key Principle:** Users control the optimization, system suggests smartly.

### Configuration Options
1. **Preset selection** (quick start)
2. **Custom sliders** (fine-tune)
3. **Personal constraints** (respect current situation)
4. **Goal toggling** (what matters to you?)
5. **Strategy toggles** (agree with smart allocation?)

### Multiple Solutions
- Not "one right answer," but ranked options
- Each with pros/cons clearly labeled
- User picks the one that matches their playing style

### Save/Export
- Save preferred configs
- Export rosters to compare
- Share with community

---

## Implementation Phases

### Phase 1: Foundation (Low effort, high value)
- [ ] Build skill-to-stafftype exclusivity analyzer
- [ ] Calculate slot exhaustion for each expedition
- [ ] Create flexibility score metric
- [ ] Build simple "Pragmatist" optimizer (greedy algorithm)
- [ ] UI: Show slot exhaustion info on expeditions

### Phase 2: Full Optimizer (Medium effort, very high value)
- [ ] Implement multiple optimization algorithms
- [ ] Add preference/constraint system
- [ ] Create preset modes
- [ ] Build multi-solution presenter
- [ ] Add smart skill allocation logic

### Phase 3: Advanced Features (High effort, situational value)
- [ ] Event filtering integration
- [ ] Save/export functionality
- [ ] Community sharing
- [ ] Training effort visualization
- [ ] What-if scenario planner

### Phase 4: Polish (Medium effort, UX improvement)
- [ ] Better UI for configuration
- [ ] Explainable AI (why this recommendation?)
- [ ] Tutorial/help system
- [ ] Advanced analytics

---

## Key Metrics & Visualizations

### Metrics to Track
- **Total Staff Count**
- **Total Training Slots** (sum of all skill levels)
- **Slot Distribution** (how many at 3/4/5)
- **Training Effort Estimate** (relative difficulty)
- **Coverage %** (expeditions possible)
- **Flexibility Score** (room for optimization)
- **Non-Expedition Utility Score** (game value outside expeditions)

### Visualizations
- Slot distribution pie chart
- Staff training roadmap (step-by-step)
- Skill heatmap (which skills on which types)
- Expedition dependency graph (which needs which skills)
- Training effort comparison (your solution vs. alternatives)

---

## Open Questions

1. **How to weight training effort?** Is pushing 1 person to 5 slots harder than hiring 2 new people at 3 slots?
2. **Non-expedition utility values:** How much should we value Aerodynamics vs. other skills?
3. **Event filtering integration:** How much should risk tolerance affect optimization?
4. **Community modes:** Do players want to share/compare rosters?
5. **DLC handling:** Are there DLC-specific staff types and skills to account for?

---

## Success Criteria

The Staff Optimization Package is successful if:

- ✅ User D can generate "Everything Museum" roster with minimal manual work
- ✅ User B can plan ahead efficiently for target rewards
- ✅ User C can understand why conflicts exist and what's needed
- ✅ Users understand the trade-offs between staff count and training effort
- ✅ Smart allocation rules feel intuitive and match game design
- ✅ Multiple solutions let users pick their preferred approach

---

## References

- **EVENT_FILTERING_IMPLEMENTATION.md** - Event filtering (future feature)
- **USER_SUGGESTIONS_TODO.md** - All user-requested features
- **skillRules.ts** - Skill exclusivity definitions
- **expeditionMatcher.ts** - Current feasibility checking logic

---

**Document Created:** January 14, 2026  
**Status:** Planning/Exploration Phase  
**Next Step:** Decide on implementation priority and phasing
