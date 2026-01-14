# PROJECT CONTEXT - Two Point Planner

**Last Updated:** January 14, 2026  
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

**Technology Stack:**
- Frontend: React + TypeScript + Vite
- Styling: CSS (custom)
- Data: CSV files + TypeScript hardcoded data
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

### 2. Skill Exclusivity (In skillRules.ts)

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

### 3. Forced Compositions (KEY INSIGHT)

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

### 4. Training Effort Curve (IMPORTANT FOR USER D)

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

### 5. Non-Expedition Utility (SKILL ALLOCATION)

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

**CURRENT STATE:** Inconsistent
- Expeditions: Hardcoded in TypeScript (950 lines)
- Rewards: Parsed from CSV dynamically
- Events: CSV exists but unused
- Skill Requirements: Partially in CSV, partially in code

**DECISION MADE:** Move to all CSV

**Rationale:**
- Single source of truth
- Non-coders can update
- Essential for DLC support
- Easier to validate

**CSVs to use:**
- Expeditions.csv (name, map)
- ExpeditionSkillRequirements.csv
- ExpeditionStaffRequirements.csv
- ExpeditionEvents.csv
- ExpeditionRewardTypes.csv

**Status:** Not yet implemented (Phase 1, item 1.1)

---

### Configuration Management

**DECISION MADE:** Centralize in gameRules.ts

**What goes there:**
```typescript
GAME_CONSTANTS = {
  staffSystem: { maxSlots: 5, maxSkillLevel: 3 },
  skillCategories: { universal: [...], expertOnly: [...] },
  staffTypeSkills: { /* all restrictions */ },
  nonExpeditionUtility: { /* utility scores */ },
  optimizer: { /* preset configs */ },
}
```

**Rationale:**
- Single source for all rules
- Easy to tweak balance
- Optimizer can reference
- Community can suggest changes

**Status:** Not yet implemented (Phase 1, item 1.2)

---

### Testing & Quality Assurance

**DECISION MADE:** Jest + React Testing Library

**When:**
- Before optimizer work (too complex to test manually)
- Before CI/CD setup
- Core priority

**Tests needed:**
- expeditionMatcher edge cases
- skillRules validation
- Data loading (CSV parsing)
- Optimizer correctness (when built)

**Status:** Not yet implemented (Phase 1, item 1.3)

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

**Status:** Not yet implemented (Phase 1, item 1.4)

---

## Features Planned (Roadmap)

### Phase 1: Infrastructure (Mode 1) - 4 weeks

**Critical (blocking features):**
- [x] 1.1: Move expeditions to CSV (3-4 days) - **COMPLETED Jan 14**
- [x] 1.2: Create gameRules.ts (1-2 days) - **COMPLETED Jan 14**
- [ ] 1.3: Add Jest tests (2-3 days)
- [ ] 1.4: Set up CI/CD (1 day)

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

## Project Files Reference

### Documentation Files (Read Before Starting)
- **EVENT_FILTERING_IMPLEMENTATION.md** - How event filtering works, step-by-step plan, no breaking changes
- **STAFF_OPTIMIZATION_PACKAGE.md** - Comprehensive optimizer design, use cases, algorithm overview
- **PRODUCT_ROADMAP.md** - Prioritized list of all work, timelines, effort/value analysis
- **This file** - PROJECT_CONTEXT.md (you are here)

### Source Code Files
- **src/data/expeditions.ts** - Hardcoded expedition data (to be moved to CSV in Phase 1.1)
- **src/utils/skillRules.ts** - Skill exclusivity rules, expert definitions
- **src/utils/expeditionMatcher.ts** - Core matching algorithm (complex combinations logic)
- **src/App.tsx** - Main app state and component orchestration

### Data Files
- **Expeditions.csv** - Expedition names and maps
- **ExpeditionSkillRequirements.csv** - Skill requirements (all events)
- **ExpeditionStaffRequirements.csv** - Staff type requirements
- **ExpeditionEvents.csv** - Events that occur on expeditions (unused, for future)
- **ExpeditionRewardTypes.csv** - Rewards given by expeditions

---

## Current Blockers & Next Steps

### Immediate Blockers
1. **Expeditions in TS vs. CSV**: Inconsistent data approach
2. **No tests**: Can't safely optimize
3. **No gameRules.ts**: Config scattered everywhere

### What's Needed Before Optimizer Work
1. CSV data loading (1.1)
2. gameRules.ts (1.2)
3. Jest tests (1.3)

### Recommended Next Session
1. Decide: Do Mode 1 critical items first (2 weeks) or jump to features?
2. Decide: What's your timeline? Deadline?
3. Decide: Which user (A/B/C/D) do you want to serve first?
4. Pick: One Mode 1 task to start (probably 1.1)

---

## Key Decisions You've Made

1. **Data-first approach:** Move expeditions to CSV (not database)
2. **Testing:** Jest before optimizer (not optional)
3. **Infrastructure now:** Better to invest now than regret later
4. **No backend yet:** Stay frontend-only for now
5. **Community-friendly:** Eventually want contributions

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
|------|--------|-----------|
| 2026-01-14 | Initial creation | Setup session |

---

**Document Status:** Active (Read Before Each Session)  
**Last Verified:** January 14, 2026  
**Next Review:** Before Phase 1 work starts
