# PROJECT CONTEXT - Two Point Planner

**Last Updated:** January 15, 2026  
**For:** GitHub Copilot / AI Assistant  
**Purpose:** Complete project context to avoid re-explaining things each session

---

## ⚠️ IMPORTANT INSTRUCTION

**Before starting work each session:**
1. Read this file completely
2. If anything seems outdated or incorrect, IMMEDIATELY ask the user to clarify/update
3. During the session, if you discover a misunderstanding, PAUSE and ask: "Should I update PROJECT_CONTEXT.md with this clarification?"
4. Never assume context from previous sessions - this file is your source of truth

---

## Project Overview

**Project Name:** Two Point Planner

**Goal:** Help players of Two Point Museum plan and optimize expedition staff rosters. Eventually become a comprehensive expedition planning platform.

**Current State:** MVP works. Users can:
- Add staff members with skills
- Assign staff to expeditions
- See which expeditions are possible/partial/impossible
- Filter expeditions by map/reward/status
- Save rosters to localStorage

**Code Quality Status:**
- ✅ Jest testing framework in place (75 tests, all passing)
- ✅ Core game rules consolidated and tested
- ✅ "General Staff" misconception removed (code now only contains 13 real staff types)
- ✅ No hardcoded data (all from CSVs)
- ✅ Build & dev server stable

**Technology Stack:**
- Frontend: React + TypeScript + Vite
- Styling: CSS (custom)
- Data: CSV files (dynamic loading, no hardcoded data)
- Storage: localStorage (browser)
- Testing: None yet
- CI/CD: None yet

**Core Problem Being Solved:**
Currently hardcoded "lump sum" requirements (to handle ALL events). Users want flexibility to:
- Plan for specific goals (rewards, not completeness)
- Accept calculated risks (skip certain event types)
- Optimize roster composition (minimize training effort)
- See exactly which staff do what

---

## User Types & Needs

### User A: "What staff is needed for these rewards?"

**Profile:** Quick lookup, specific goal oriented

**Goal:** Find requirements for specific expeditions

**Current Experience:** 
- Filters by reward
- Sees which expeditions give it
- Reads requirements
- Writes down manually

**Pain Points:**
- Must aggregate requirements manually
- No copy/export
- Can't see "minimum staff" view

**How to Serve:**
- Show union of requirements across filtered expeditions
- Export feature
- Optimization showing minimum viable composition

**Value:** Medium (simpler user, but frequent)

---

### User B: "How do I build a roster for these rewards?"

**Profile:** Advanced planner, lots of manual work

**Goal:** Create roster that covers specific rewards efficiently

**Current Experience:**
- Identifies rewards manually
- Reverse-engineers requirements
- Tests roster by adding staff one-by-one
- No idea if optimal

**Pain Points:**
- Reverse-matching is impossible
- No multi-expedition view
- No conflict detection
- Tedious iteration
- No roster templates

**How to Serve:**
- Multi-expedition selection
- Recommend staffing options
- Show conflicts
- Save/compare rosters
- Optimizer suggestions

**Value:** High (advanced users, heavy engagement)

---

### User C: "I have THIS staff. What conflicts do I have?"

**Profile:** Current game player checking feasibility

**Goal:** Validate current roster against expeditions

**Current Experience:**
- Inputs all staff
- Sees individual expedition feasibility
- Doesn't know if "possible" expeditions conflict

**Pain Points:**
- No conflict detection between expeditions
- No "can I run these 3 simultaneously?" checking
- No scheduling view

**How to Serve:**
- Show which expeditions conflict
- Identify non-conflicting sets
- Staff assignment display
- Timeline view

**Value:** High (captures real problem)

---

### User D: "I want an Everything Museum"

**Profile:** Long-term planner, all 150+ expeditions, global optimization

**Goal:** Optimal roster to run every expedition eventually

**Current Experience:**
- Manually cross-references requirements
- Tries to find patterns
- Builds roster guesses
- No systematic approach
- Over/under-builds staff

**Pain Points:**
- No global optimizer
- No impact analysis (which skill unlocks what?)
- No bottleneck identification
- No training effort understanding
- Can't compare approaches

**How to Serve:**
- **CRITICAL:** Staff Optimizer with multi-solution approach
- Coverage analysis (% of expeditions possible)
- Skill value analysis (which skills matter most)
- Staff type bottleneck detection
- Training effort visualization
- Growth path recommendations
- Redundancy analysis

**Value:** VERY HIGH (game-changing for this user)

---

## Core Technical Insights (CRITICAL)

### 1. Slot System

**Definition:**
- Each staff member has **5 skill slots total**
- Each skill level uses 1 slot
  - Survival Skills L2 = 2 slots
  - Pilot Wings L1 = 1 slot
  - Fish Whispering L2 = 2 slots
- Max level per skill = 3

**Example:**
```
Marine Life Expert with:
  - Fish Whispering L2 (2 slots)
  - Survival Skills L2 (2 slots)  
  - Survey Skills L1 (1 slot)
  = 5/5 slots FULL
  = No room for anything else
```

---

### 2. Skill Exclusivity (In gameRules.ts)

**Universal Skills** (any staff can learn):
- Aerodynamics
- Happy Thoughts
- Pilot Wings

**Expert-Only Skills** (only expert types):
- Analysis
- Rapid Restoration
- Survey Skills
- Survival Skills
- Tour Guidelines

**Type-Exclusive Skills** (only one type):
- Fish Whispering → Marine Life Expert ONLY
- Potion Master → Fantasy Expert ONLY
- Animal Analysis → Wildlife Expert ONLY
- Button Master → Digital Expert ONLY
- Spirit Whispering → Supernatural Expert ONLY
- Fire-Resistance → Janitor ONLY
- Ghost Capture → Janitor ONLY
- Mechanics → Janitor ONLY
- Workshop → Janitor ONLY
- Camera Room → Security Guard ONLY
- Strolling Surveillance → Security Guard ONLY
- Accomplished Admission → Assistant ONLY
- Customer Service → Assistant ONLY
- Marketing → Assistant ONLY

---

### 3. Real Staff Types (CORRECTED January 15, 2026)

**The 13 Real Staff Types:**
```
Experts (9):
  - Prehistory Expert
  - Botany Expert
  - Fantasy Expert
  - Marine Life Expert
  - Wildlife Expert
  - Digital Expert
  - Supernatural Expert
  - Science Expert
  - Space Expert

Support (4):
  - Janitor
  - Security Guard
  - Assistant

Total: 13 types
```

**Note on "General Staff":**
 Previously thought "General Staff" was a real type that could have any universal skills.
 This was a misconception. Removed from codebase January 15, 2026.
 
**"ANY Staff" Means:**
 Expedition requirement of "ANY Staff" = "any of the 13 defined types"
 NOT a special staff type. Just flexible matching.

---

### 4. Forced Compositions (KEY INSIGHT)

**What is it:**
When an expedition has exclusive skills that fill exactly 5 slots, that staff type is "locked" and can't be optimized.

**Example: Darkest Depths**
```
Requirements:
  - 1 Marine Life Expert
  - 1 Security Guard
  - Pilot Wings L2
  - Fish Whispering L2
  - Survival Skills L2
  - Survey Skills L1

Marine Life Expert MUST have:
  - Fish Whispering L2 (exclusive, 2 slots)
  - Survival Skills L2 (exclusive, 2 slots)
  - Survey Skills L1 (exclusive, 1 slot)
  = 5/5 slots COMPLETELY LOCKED

Security Guard MUST have:
  - Pilot Wings L2 (2 slots)
  = 2/5 slots (flexible, 3 free)

Result: ZERO flexibility in composition. This is the ONLY way to satisfy it.
```

**Impact:**
- These expeditions CANNOT be optimized
- They force specific staff training
- User D needs to know which are locked vs. flexible
- Affects roster planning strategy

---

### 5. Training Effort Curve (IMPORTANT FOR USER D)

**Reality in the game:**
Training to 5 slots is exponentially harder than training to 3.

```
Cost curve (estimated):
  0→1: LOW
  1→2: LOW
  2→3: LOW
  3→4: MEDIUM (spike!)
  4→5: HIGH (steep spike!)
```

**Decision:**
```
Option A: Train 1 person to 5 slots (hard)
Option B: Hire 2 people at 3 slots each (easier overall)
```

Often Option B is better, but depends on game design.

**User D needs:**
- Understand this trade-off
- Choose between "fewest staff" vs. "least training effort"
- Different solutions for different goals

---

### 6. Non-Expedition Utility (SKILL ALLOCATION)

**Concept:**
Some skills have value outside expeditions (in normal game operations).

**High Utility:**
- **Aerodynamics** on Security Guard: Critical for helicopter incidents
- **Pilot Wings** on non-experts: Useful for general helicopter/plane management
- **Fire-Resistance** on Janitor: Useful in dangerous areas

**Low/Situational Utility:**
- **Happy Thoughts**: Only needed in Netherworld (situational)
- **Ghost Capture**: Only if ghost incidents happen
- **Fish Whispering**: Expedition-only (exclusive to Marine Life Expert)

**Smart Allocation Rule:**
Put Happy Thoughts on Janitor (spare slots, situational use) instead of Prehistory Expert (already slot-constrained, needs other skills).

---

## Architecture Decisions Made

### Data Structure

**CURRENT STATE:** Fully CSV-based ✅
- Expeditions: Loaded from CSV dynamically (159 expeditions)
- Rewards: Loaded from CSV (338 items)
- Events: Loaded from CSV (668 events with counters)
- Skill Requirements: Loaded from CSV
- Staff Requirements: Loaded from CSV

**HOW IT WORKS:**
1. `loadExpeditions.ts` fetches all 5 CSVs in parallel
2. `csvParser.ts` parses each CSV (handles quoted fields, escapes, newlines)
3. `dataValidator.ts` validates skill names and staff types
4. Data joined by expedition name into Map (preserves CSV order)
5. Secondary indices built for fast lookup
6. Returned as `Expedition[]` with all data populated

**CSVs Used:**
- `Expeditions.csv` (name, map)
- `ExpeditionSkillRequirements.csv` (expedition, skill, level)
- `ExpeditionStaffRequirements.csv` (expedition, staffType, quantity)
- `ExpeditionEvents.csv` (expedition, event details with counters)
- `ExpeditionRewardTypes.csv` (expedition, reward, type, subtype)

**CSV File Locations:**
- Development: Root directory (for dev access)
- Web serving: `/public/` folder (served by Vite to browser)
- Production: `/dist/` folder (built into static site)
- Note: All 5 CSVs must exist in ALL THREE locations

**Status:** ✅ COMPLETED (Phase 1.1) - Implemented January 14, 2026

---

### Configuration Management

**CURRENT STATE:** Centralized in src/config/gameRules.ts ✅

**What's in gameRules.ts:**
```typescript
// Constants
STAFF_SYSTEM = {
  maxSlots: 5,
  maxSkillLevel: 3,
}

// Hierarchical skill organization
SKILL_CATEGORIES = {
  universal: [Aerodynamics, Happy Thoughts, Pilot Wings],
  expertOnly: [Analysis, Rapid Restoration, Survey Skills, ...],
  typeExclusive: { Marine Life Expert: [Fish Whispering], ... },
}

// What each staff type can learn
SKILL_RESTRICTIONS = Record<StaffType, Set<Skill>>

// Preference-based utility scores (not hard rules)
SKILL_UTILITY = {
  Aerodynamics: { utility: 8, notes: "Fast Security Guards catch criminals" },
  Pilot Wings: { utility: 7, notes: "Speeds up expeditions" },
  Happy Thoughts: { utility: 3, notes: "Mostly useless, needed for Netherworld" },
  // ... etc
}

// Scaffolding for Phase 3.1 optimizer
OPTIMIZER_PRESETS = {
  Perfectionist: { /* config */ },
  Pragmatist: { /* config */ },
  // ... etc
}

// Utility functions
getAvailableSkills(staffType)
canHaveSkill(staffType, skill)
isExpert(staffType)
getMaxSkillSlots(staffType)
calculateUsedSkillSlots(staff)
// ... etc
```

**Key Insight - Skill Utility is Preference-Based:**
Unlike skill restrictions (hard rules), utilities are flexible preferences:
- Can be tweaked per balance patches
- Different users may weight differently
- Optimizer uses these as guidance, not requirements
- Makes code future-proof for balance changes

**Rationale:**
- Single source for all rules
- Easy to tweak balance
- Optimizer can reference
- Flexible for community balance discussions
- Non-coders can understand the scoring

**Files Updated:**
- `SkillSelector.tsx` - imports from gameRules
- `StaffList.tsx` - imports from gameRules
- `expeditionMatcher.ts` - imports from gameRules

**Files Deleted:**
- `src/utils/skillRules.ts` - consolidation complete

**Status:** ✅ COMPLETED (Phase 1.2) - Implemented January 14, 2026

---

### Testing & Quality Assurance

**DECISION MADE:** Jest + React Testing Library

**When:**
- Before optimizer work (too complex to test manually)
- Before CI/CD setup
- Core priority (Phase 1.3)

**Core Tests (Phase 1.3 - ✅ COMPLETED Jan 15):**
- expeditionMatcher edge cases (especially Darkest Depths) ✅
- gameRules validation (skill restrictions, slot calculations) ✅
- Data loading (CSV parsing, validation) ✅
- Slot calculation accuracy ✅
- Skill restriction enforcement ✅

**Test Results:** 77 tests passing, all critical edge cases covered

**IMPORTANT - Testing Requirements for New Features:**
- Every new feature MUST include tests before merge
- Optimizer tests (Phase 3.1): Prove correctness on all 159 expeditions
- Event filtering tests (Phase 3.2): Verify dynamic requirement changes
- Multi-expedition tests (Phase 3.3): Verify conflict detection works
- Ask Copilot: "What tests do we need for this feature?" (reminder)
- No feature is "done" without green tests

**Status:** ✅ COMPLETED (Phase 1.3) - Implemented January 15, 2026

---

### CI/CD Pipeline

**DECISION MADE:** GitHub Actions

**What it does:**
- Runs tests on every push
- Lints code
- Builds verification
- Shows ✅/❌ on GitHub

**Rationale:**
- Catches bugs before merge
- Safe for future contributors
- Professional quality bar
- Depends on Phase 1.3 (tests must exist first)

**Status:** Not yet implemented (Phase 1.4, pending after 1.3)

---

## Features Planned (Roadmap)

### Phase 1: Infrastructure (Mode 1) - 4 weeks

**Critical (blocking features):**
- [x] 1.1: Move expeditions to CSV (3-4 days) - **✅ COMPLETED Jan 14**
- [x] 1.2: Create gameRules.ts (1-2 days) - **✅ COMPLETED Jan 14**
- [x] 1.3: Add Jest tests (2-3 days) - **✅ COMPLETED Jan 15**
- [ ] 1.4: Set up CI/CD (1 day) - **PENDING** (after 1.3)

**Important (alongside Phase 2):**
- [ ] 2.1: Data versioning (2 days)
- [ ] 2.2: Documentation (2-3 days)
- [ ] 2.3: Performance optimization (2-3 days)
- [ ] 2.4: Environment config (0.5 days)

---

### Phase 2: Core Features (Mode 2) - 4 months

**High Priority:**
- [ ] 3.1: Staff Optimizer (8-10 days, 3 phases)
  - Phase A: Slot exhaustion analyzer + config
  - Phase B: Smart skill allocation
  - Phase C: Multi-solution optimizer
- [ ] 3.2: Event Filtering (5-6 days)
- [ ] 3.3: Multi-Expedition Features (6-7 days)

**Good-to-Have:**
- [ ] 4.1: Staff naming + collapsing (2-3 days)
- [ ] 4.2: Save/load filter sets (2-3 days)
- [ ] 4.3: Save/load rosters (2-3 days)

**Future (DLC):**
- [ ] 4.4: Stat requirements
- [ ] 4.5: Item tracking
- [ ] 4.6: Seasonal expeditions

---

## Work Mode Preference

**Your Communication Style:**
- Prefer layman's terms (no jargon without explanation)
- Like analogies and real examples
- Want to understand WHY before HOW
- Want documentation to reference later

**Your Technical Level:**
- Little to no coding experience
- Learning as you go
- Prefer to read explanations than guess

**Decision Making:**
- Wants multiple options with trade-offs
- Wants to understand impact before committing
- Prefers exploration before implementation
- Values long-term thinking over quick fixes

**Work Mode Preferences:**
- Capable of Mode 1 (infrastructure) but prefers Mode 2 (features)
- Understands why Mode 1 is necessary first
- Will do Mode 1 infrastructure if it unblocks better features
- Wants clear ROI analysis

---

### Project Files Reference

### Documentation Files (Read Before Starting)
- **EVENT_FILTERING_IMPLEMENTATION.md** - How event filtering works, step-by-step plan, no breaking changes
- **STAFF_OPTIMIZATION_PACKAGE.md** - Comprehensive optimizer design, use cases, algorithm overview
- **PRODUCT_ROADMAP.md** - Prioritized list of all work, timelines, effort/value analysis
- **IMPLEMENTATION_LOG.md** - Detailed log of Phase 1.1 and 1.2 implementation
- **This file** - PROJECT_CONTEXT.md (you are here)

### Source Code Files (Active)
- **src/config/gameRules.ts** - Single source of truth for all game rules and constants ✅ NEW
- **src/data/loadExpeditions.ts** - CSV loader that fetches, parses, validates, joins all expedition data ✅ NEW
- **src/data/csvParser.ts** - Generic CSV parser handling quoted fields, escapes, newlines ✅ NEW
- **src/data/dataValidator.ts** - Validates loaded data against game rules ✅ NEW
- **src/utils/expeditionMatcher.ts** - Core matching algorithm (complex combinations logic)
- **src/App.tsx** - Main app state and component orchestration

### Source Code Files (Deleted)
- **src/data/expeditions.ts** - ❌ DELETED (replaced by CSV loading)
- **src/utils/skillRules.ts** - ❌ DELETED (consolidated into gameRules.ts)

### Data Files (CSV - All Locations)
**All 5 CSVs must exist in these locations:**
- Root: `Expeditions.csv`, `ExpeditionSkillRequirements.csv`, `ExpeditionStaffRequirements.csv`, `ExpeditionEvents.csv`, `ExpeditionRewardTypes.csv`
- `/public/` folder (for Vite to serve)
- `/dist/` folder (built automatically into production)

**CSV Contents:**
- **Expeditions.csv** - Expedition names and maps (159 expeditions)
- **ExpeditionSkillRequirements.csv** - Skill requirements by level
- **ExpeditionStaffRequirements.csv** - Staff type requirements by quantity
- **ExpeditionEvents.csv** - Events with counters (skill/stat/rank/item)
- **ExpeditionRewardTypes.csv** - Rewards with types and subtypes (338 rewards)

---

## Current Blockers & Next Steps

### Completed Blockers ✅
1. ✅ **CSV Data Loading (1.1)** - All expeditions, events, rewards load from CSV
2. ✅ **gameRules.ts (1.2)** - Single source of truth for all game rules
3. ✅ **Type Safety** - Event and EventCounter types added to Expedition

### Immediate Blockers (Remaining)
1. **No tests** - Can't safely optimize or make changes
2. **No CI/CD** - Can't verify builds or catch regressions

### What's Needed Before Optimizer Work
1. ✅ CSV data loading (1.1) - DONE
2. ✅ gameRules.ts (1.2) - DONE
3. Jest tests (1.3) - PENDING (2-3 days)
4. CI/CD pipeline (1.4) - PENDING (1 day, after 1.3)

### Recommended Next Session

**Phase 1.1 & 1.2 are COMPLETE.** Next steps:

1. **Priority A:** Phase 1.3 (Jest testing) - 2-3 days
   - Essential before optimizer work
   - Tests: expeditionMatcher, gameRules, CSV loading
   - Will make future changes safer

2. **Priority B:** Phase 1.4 (CI/CD) - 1 day (after 1.3)
   - GitHub Actions for test automation
   - Prevents regressions
   - Professional quality bar

3. **After Phase 1:** Phase 3.1 (Staff Optimizer)
   - Can safely start after 1.3 & 1.4 complete
   - Uses gameRules.ts and tested data loading
   - Will serve User D (Everything Museum goal)

**Decide:**
1. Do you want to continue with Phase 1.3 testing?
2. Timeline for optimizer work?
3. Any issues with current Phase 1.1/1.2 implementation?

---

## Key Decisions Made (& Status)

1. **Data-first approach:** Move expeditions to CSV ✅ DONE
   - Single source of truth for non-coders to update
   - Enables DLC support without code changes
   - 159 expeditions + 668 events + 338 rewards loading from CSV

2. **Testing:** Jest before optimizer (not optional) - PENDING
   - Will implement in Phase 1.3
   - Critical before Phase 3 (optimizer work)

3. **Infrastructure now:** Better to invest now than regret later ✅ PROVEN
   - Phase 1.1 & 1.2 complete in 1 evening session
   - Unblocks entire optimizer development
   - Cleaner codebase for future contributors

4. **No backend yet:** Stay frontend-only ✅ CONFIRMED
   - CSV approach works perfectly
   - Can scale to larger datasets easily
   - Users can manage CSV exports/updates

5. **Community-friendly:** Eventually want contributions ✅ PREPARED
   - gameRules.ts makes balance tweaks obvious
   - CSV data is accessible to non-programmers
   - IMPLEMENTATION_LOG.md documents decisions

---

## Important Clarifications & Edge Cases

### Darkest Depths is THE REFERENCE EXAMPLE
- Use it to test any matching/optimization changes
- It has zero flexibility (perfect test case)
- If it works for Darkest Depths, optimizer is correct

### CSV Parsing is Critical
- All expedition data must load from CSV
- No hardcoded fallbacks
- Validation layer essential (catch inconsistencies)
- Error messages matter (help non-coders debug)

### Event Filtering is Future, Not MVP
- Current system is "lump sum" (handles all events)
- Event filtering is optimization, not essential
- Can be added later after optimizer works
- Don't block MVP on this

### Staff Slots are Non-Negotiable
- 5 slots per staff is game rule (not changing)
- This creates many forced compositions
- Optimizer must respect this constraint
- Users understand this limit (from game)

---

## Testing Checklist for Key Features

**When optimizer is built, must test:**
- ✅ Darkest Depths (forced 5-slot composition)
- ✅ Simple expeditions (0-1 skills)
- ✅ Multi-skill expeditions
- ✅ Exclusive skill requirements
- ✅ ANY Expert matching
- ✅ ANY Staff matching
- ✅ Large rosters (50+ staff)
- ✅ Edge case: 0 staff
- ✅ Edge case: no matching solution

---

## Questions to Ask If Unclear

If you encounter something that seems wrong, ask:

```
"Does PROJECT_CONTEXT.md still match your actual preference for [X]?"

"Should I update the context file with this new understanding?"

"Is this still the right approach, or did you mean something different?"
```

Do NOT guess or assume. Always clarify.

---

## Version History

| Date | Change | Updated By |
|------|--------|-------------|
| 2026-01-15 | Phase 1.3 Completion: Jest testing framework live, 77 tests passing, Darkest Depths edge case verified | Post-implementation review |
| 2026-01-14 | Phase 1.1 & 1.2 Completion: CSV loading live, gameRules.ts created, obsolete references removed | Post-implementation review |

---

**Document Status:** Active (Read Before Each Session)  
**Last Updated:** January 15, 2026 (Phase 1.3 Complete)  
**Verified Working:** CSV loading in production ✅, gameRules.ts live ✅, 159 expeditions loading ✅, Jest testing framework ✅ (77 tests passing)  
**Next Review:** Before Phase 1.4 CI/CD setup
