# Product Roadmap

**Last Updated:** January 16, 2026 (Data & asset updates deployed - Phase 1.7 Complete)
**Project:** Two Point Planner  
**Status:** Execution Phase (Mode 1: Critical Infrastructure - 100% Complete ✅, Data Updated)

---

## Executive Summary

This roadmap outlines all planned improvements split into two work modes:
- **Mode 1:** Infrastructure & Code Quality improvements
- **Mode 2:** Feature Development

The roadmap identifies dependencies, prioritizes blocking work, and estimates effort/value for each initiative.

---

## Mode 1: Infrastructure & Code Quality

**Completion Status: 100%** (7 of 7 critical items complete) ✅

### Priority Tier 1: BLOCKING (Do First)

**STATUS:**
- ✅ 1.1: CSV data migration (COMPLETE)
- ✅ 1.2: Centralized game rules (COMPLETE)
- ✅ 1.3: Testing framework (COMPLETE + cleanup)
- ✅ 1.4: CI/CD pipeline (COMPLETE)
- ✅ 1.5: Icon data structure (COMPLETE)
- ✅ 1.6: Production deployment (COMPLETE - asset serving fixed, git case sensitivity resolved)
- ✅ 1.7: Data & asset updates (COMPLETE - 7 new expeditions, 6 placeholder icons, icon naming fixed)

These items block Mode 2 work and must be done before feature development.

---

#### **1.1 Move Expeditions from TypeScript to CSV**

**Status: ✅ COMPLETED**

**What Was Done:**
- Created `src/data/csvParser.ts` (generic CSV parser handling quoted fields, escapes, newlines)
- Created `src/data/dataValidator.ts` (validates skills, staff types, levels with helpful error messages)
- Created `src/data/loadExpeditions.ts` (main loader: fetches 5 CSVs in parallel, parses, validates, joins by expedition name)
- Updated `src/types/index.ts` (added Event and EventCounter interfaces)
- Updated `src/App.tsx` (removed hardcoded import, now loads from CSV on startup)
- Archived `src/data/expeditions.ts` → `expeditions.ts.backup` (prevents conflicts)

**Current State:**
- Expeditions.csv (159 rows) ✅
- ExpeditionSkillRequirementsBaseOnly.csv (34 rows) ✅
- ExpeditionStaffRequirements.csv (287 rows) ✅
- ExpeditionEvents.csv (668 rows) ✅
- ExpeditionRewardTypes.csv (338 rows) ✅

**Verified:**
- ✅ All 159 expeditions load from CSV
- ✅ Data validated (validation report in console)
- ✅ App works identically to before
- ✅ Build succeeds with zero errors
- ✅ Dev server runs without errors
- ✅ Rewards display with icons (fixed: was showing types instead of names)
- ✅ Staff adding/removing works
- ✅ Feasibility checking works
- ✅ Filters work (map, reward, status)
- ✅ Events loaded and available for future use

**Impact:**
- ✅ Single source of truth: data now lives in CSVs, not TypeScript
- ✅ Non-coders can edit CSVs in Excel; no rebuild needed
- ✅ Data integrity validated automatically
- ✅ Future-proof: ready for DLC, stat requirements, item tracking
- ✅ Unblocks: Optimizer work, Event filtering, Multi-expedition features

**Estimated Effort:** 3-4 days
**Estimated Value:** 9/10 (critical blocker)
**Difficulty:** Medium
**Completed:** January 14, 2026

---

#### **1.2 Create Centralized Game Rules Configuration**

**Status: ✅ COMPLETED**

**What Was Done:**
- Created `src/config/gameRules.ts` (380+ lines)
- Moved SKILL_RESTRICTIONS from skillRules.ts
- Added SKILL_CATEGORIES (universal, expertOnly, typeExclusive)
- Added STAFF_SYSTEM constants (maxSlots: 5, maxSkillLevel: 3)
- Defined SKILL_UTILITY preferences with examples:
  - Aerodynamics (utility 8): Fast Security Guards catch criminals
  - Pilot Wings (utility 7): Speeds up expeditions
  - Happy Thoughts (utility 3): Needed for Netherworld, use "mule" staff
  - Fire-Resistance, Ghost Capture, Camera Room (situational)
- Added OPTIMIZER_PRESETS scaffolding (Perfectionist, Pragmatist, Efficient, Minimalist)
- Consolidated utility functions (getAvailableSkills, canHaveSkill, isExpert, etc.)
- Updated 3 files to import from gameRules instead of skillRules
- Deleted old skillRules.ts (consolidation complete)

**Verified:**
- ✅ Build succeeds with 0 errors
- ✅ All imports updated correctly
- ✅ No functional changes to app (refactoring only)
- ✅ Code is cleaner and more maintainable

**Impact:**
- ✅ Single source of truth for all game rules
- ✅ Skill utilities are flexible and tweakable
- ✅ Optimizer presets scaffolded for Phase 3.1
- ✅ Future-ready for user-configurable preferences
- ✅ Unblocks: Staff Optimizer work

**Estimated Effort:** (January 15, 2026)**

**What Was Done:**
- Installed Jest + React Testing Library + ts-jest
- Created `jest.config.ts` with TypeScript support
- Created test setup file: `src/__tests__/setup.ts`
- Written 4 core test files with 75 total tests:
  - `gameRules.test.ts` (23 tests) - Skill restrictions, slot system, utility scoring
  - `slotSystem.test.ts` (18 tests) - **Darkest Depths edge case verified (5/5 slots LOCKED)**
  - `expeditionMatcher.test.ts` (20 tests) - Complex matching logic, Darkest Depths matching
  - `dataLoading.test.ts` (14
**What Was Done:**
- Installed Jest + React Testing Library + ts-jest
- Created `jest.config.ts` with TypeScript support
- Created test setup file: `src/__tests__/setup.ts`
- Written 5 core test files with 77 total tests:
  - `gameRules.test.ts` (26 tests) - Skill restrictions, slot system, utility scoring
  - `slotSystem.test.ts` (18 tests) - **Darkest Depths edge case verified (5/5 slots LOCKED)**
  - `expeditionMatcher.test.ts` (20 tests) - Complex matching logic, Darkest Depths matching
  - `dataLoading.test.ts` (13 tests) - CSV parsing, data validation
- Added npm scripts: `npm test`, `npm test:watch`, `npm test:coverage`
- All tests passing ✅

**Test Coverage Achieved:**
- ✅ Darkest Depths forced composition (0 flexibility case)
- ✅ Slot calculation accuracy (5 slots per staff)
- ✅ Skill restrictions by staff type
- ✅ CSV parsing with quoted fields and escapes
- ✅ Expedition matching with ANY Expert / ANY Staff
- ✅ Edge cases: 0 staff, missing skills, partial fulfillment

**Estimated Effort:** 2-3 days (actual: 1 day)
**Estimated Value:** 9/10 (enables safe iteration + prevents regressions)
**Difficulty:** Medium
**Completed:** January 15, 2026

**Post-Completion Cleanup (January 15, 2026):**
- Removed non-existent "General Staff" type from entire codebase (misconception cleanup)
- Updated 8 files: types.ts, gameRules.ts, dataValidator.ts, iconMaps.ts, 3 test files, PRODUCT_OVERVIEW.md
- All 75 tests still passing after cleanup
- Build successful, deployed to live

---

#### **1.4 Set Up CI/CD Pipeline (GitHub Actions)**

**Status: ✅ COMPLETED (January 16, 2026)**

**What Was Done:**
- Created `.github/workflows/test.yml` (GitHub Actions workflow)
- Configured automated checks on every push to main/develop:
  - TypeScript compilation check (`tsc --noEmit`)
  - Jest test suite (all 75 tests)
  - Production build verification (`npm run build`)
- Installed `ts-node` as dev dependency (required for Jest to parse TypeScript config)
- Fixed workflow to run cleanly on Ubuntu Linux
- Verified workflow passes on GitHub Actions

**Verified:**
- ✅ Workflow file created and committed
- ✅ Runs automatically on every push
- ✅ All checks pass (TypeScript + Tests + Build)
- ✅ Shows ✅ status on GitHub (green checkmark on commits)
- ✅ Works on both Windows (local) and Ubuntu Linux (GitHub)

**Impact:**
- ✅ Automated quality gate on all code
- ✅ Can't accidentally break production
- ✅ Safe foundation for team collaboration
- ✅ Every commit is verified to work
- ✅ Unblocks: Multi-contributor workflows

**Estimated Effort:** 1-2 days (actual: 1 day)
**Estimated Value:** 6/10 (safety net)
**Difficulty:** Easy
**Completed:** January 16, 2026

**Success Criteria Met:**
- ✅ Workflow file created
- ✅ Runs automatically on every push
- ✅ Shows ✅/❌ status on GitHub commits
- ✅ All checks pass (0 failures)


---

#### **1.5 Review & Optimize Icon/Image Data Structure**

**Status: ✅ COMPLETED (January 16, 2026)**

**What Was Done:**
1. **Unified Naming Convention:** Standardized all 618 icon files to `lowercase-with-hyphens.webp` format
   - Expeditions: 150 files (`Title-Case` → `lowercase-with-hyphens`)
   - Events: 135 files (`Title-Case` → `lowercase-with-hyphens`, fixed URL encoding issues)
   - Rewards: 325 files (removed `-Icon` suffix, `Title-Case` → `lowercase-with-hyphens`)
   - Maps: 8 files (removed `-Icon` suffix, `Title-Case` → `lowercase-with-hyphens`)
   - Staff Types: 14 files (already correct, no changes)
   - Skills: 21 files (already correct, no changes)

2. **Created Normalization Functions:**
   - `normalizeExpeditionName()` - Converts expedition names to filenames
   - `normalizeEventName()` - Converts event names to filenames (NEW)
   - `normalizeRewardName()` - Converts reward names to filenames
   - All handle special characters consistently (apostrophes removed, `&` → `n`, etc.)

3. **Updated Asset Registry & Icon Maps:**
   - Updated `src/config/assetRegistry.ts` (simplified reward special cases, updated map icons mapping)
   - Updated `src/utils/iconMaps.ts` (added `getEventIcon()` function for event icons)
   - All normalization functions now generate lowercase filenames

4. **Verified & Tested:**
   - ✅ Build succeeds (zero errors, 2.31s build time)
   - ✅ All 618 files correctly served from `/dist/assets/`
   - ✅ Icons displaying correctly in dev server
   - ✅ Git commit: `e171345` pushed

**Benefits Achieved:**
- **Zero custom mapping needed** for expeditions/events/rewards/maps → direct name→filename conversion
- **Consistent across all categories** → predictable file organization
- **URL-safe filenames** → no special character encoding issues
- **Case-insensitive lookups possible** → more flexible code
- **Simplified normalization functions** → easier to maintain and test
- **Better asset management** → single clear naming rule for all 653+ files

**Dependencies:**
- None (all previous phases complete)

**Estimated Effort:** 2-3 days  
**Estimated Value:** 7/10 (enables clean Phase 2 work)  
**Difficulty:** Medium  
**Completed:** January 16, 2026

**Success Criteria:**
- ✅ All icon filenames follow `lowercase-with-hyphens.webp` pattern
- ✅ No `-Icon` suffixes (simplified and removed)
- ✅ All 618 files renamed and verified
- ✅ Asset registry updated with new mappings
- ✅ Icon mapping functions working correctly
- ✅ Build verified, icons displaying in browser
- ✅ Minimal custom mapping needed (just normalization functions)

---

#### **1.6 Production Asset Deployment & Git Case Sensitivity Fix**

**Status: ✅ COMPLETED (January 16, 2026)**

**Problem Discovered:**
- Expedition icons showing as 404 on production (Vercel)
- Icons worked fine on dev server
- Root cause: Git case sensitivity mismatch
  - Git tracked files as: `Archwise-Rise.webp` (Title-Case)
  - Disk had files as: `archwise-rise.webp` (lowercase)
  - Code generated paths: `/assets/expedition-icons/archwise-rise.webp` (lowercase)
  - When Vercel cloned repo, it got Title-Case names from git → request for lowercase names → 404

**What Was Done:**
1. **Enabled case-sensitive git tracking:**
   - Command: `git config core.ignorecase false`
   - Forces git to track file case changes on Windows
2. **Renamed all 286 asset files in git:**
   - Expedition icons: 150 files (Title-Case → lowercase)
   - Event icons: 135 files (Title-Case → lowercase)
   - Reward icons: 1 file fix (special case)
   - Commit `36fc0a8` pushed to GitHub
3. **Optimized Vercel Configuration:**
   - Updated `vercel.json` with explicit framework setting (Vite)
   - Ensured asset copying script runs: `npm run copy-assets`
   - Added asset serving rules to vercel.json
4. **Updated Build Pipeline:**
   - `vite.config.ts`: Explicit publicDir and outDir settings
   - `package.json`: `copy-assets` script ensures dist/assets/ populated
   - Tested locally: files verified in dist/

**Verified:**
- ✅ All 286 files renamed and committed
- ✅ Vercel deployment successful with latest code
- ✅ Image URLs now return correct files (200 OK instead of 404)
- ✅ Test link: `https://two-point-planner.vercel.app/assets/expedition-icons/archwise-rise.webp` loads image

**Impact:**
- ✅ Production site now shows all expedition, event, reward, and map icons
- ✅ Users can see complete interface on live version
- ✅ Unblocks: Phase 2 feature development

**Estimated Effort:** 2-3 hours investigation + fix
**Estimated Value:** Critical (blocks production usability)
**Difficulty:** Medium (debugging the root cause was hard; fix was simple)
**Completed:** January 16, 2026

**Key Learnings:**
1. **Git case sensitivity is a trap on Windows:** Git defaults to case-insensitive (`core.ignorecase = true` on Windows), silently ignoring case differences that break on case-sensitive systems like Linux
2. **Always validate git tracking matches disk:** Use `git ls-files` to verify tracked filenames match actual files, especially before deploying to Linux-based hosting
3. **Asset serving requires build verification:** Test that all assets are actually copied to production output (not just present locally)
4. **Cross-platform testing matters:** Test production build behaviors; dev server can hide issues

---

#### **1.7 Data & Asset Updates**

**Status: ✅ COMPLETED (January 16, 2026)**

**What Was Done:**
1. **Data Updates:**
   - Added 7 new expeditions to `Expeditions.csv` (166 total, up from 159)
   - Updated `ExpeditionEvents.csv` with new event data
   - Added new rewards to `ExpeditionRewardTypes.csv` (391 total, up from 338)
   - Updated `ExpeditionSkillRequirementsBaseOnly.csv` with new skill requirements
   - Updated `ExpeditionStaffRequirements.csv` with new staff requirements

2. **Icon Verification & Fixes:**
   - Renamed `portstorm.webp` → `port-storm.webp` (fixes naming convention)
   - Verified 5 existing expedition icons present:
     - `cryo-labs.webp` ✓
     - `eaten-track.webp` ✓
     - `eversteam-forest.webp` ✓
     - `lion-lowlands.webp` ✓
     - `meander-meadow.webp` ✓
   - Created 6 placeholder icons (same size, gray background) for future artwork:
     - `briskward-brook.webp`
     - `chilly-heather.webp`
     - `farflung-caves.webp`
     - `farflung-cliffs.webp`
     - `goldrush-stream.webp`
     - `under-wilds.webp`

**Verified:**
- ✅ All 166 expeditions load correctly from CSV
- ✅ All 161 expedition icons accessible in production build (no 404 errors)
- ✅ All 391 rewards displaying with correct icons
- ✅ Placeholder icons same dimensions as real icons (no layout issues)
- ✅ Build succeeds: 44 modules transformed, 0 errors
- ✅ All 75 tests passing
- ✅ Deployed to production (Vercel) ✓
- ✅ Git commits: `4e5466e` + `da7fb25`

**Impact:**
- ✅ Database current and extensible
- ✅ No 404 errors on expedition images in production
- ✅ Placeholder system allows gradual artwork addition without breaking layout
- ✅ Ready for Phase 2 feature development

**Estimated Effort:** 0.5 days
**Estimated Value:** 3/10 (data maintenance, not blocking features)
**Difficulty:** Easy
**Completed:** January 16, 2026

**Git Commits:**
- Commit `4e5466e`: `data: Add new expeditions and rewards to CSV datasets`
- Commit `da7fb25`: `assets: Fix icon naming and add expedition icons`

---

### Priority Tier 2: IMPORTANT (Do Soon)

Non-blocking improvements that improve code quality and maintainability.

---

#### **2.1 Add Data Versioning & Migration**

**Current State:**
- localStorage just overwrites data
- No version tracking
- Breaking changes lose user data

**What to Do:**
- Add `version` field to all stored data (rosters, configs)
- Create migration functions for breaking changes
- Validate data format on load
- Handle old versions gracefully

**Why It Matters:**
- Safe to iterate on data structures
- Users don't lose rosters when you update
- Professional user experience

**Dependencies:**
- After 1.1 (need stable data structure first)

**Blocks:**
- Nothing critical, but nice to have before save/load features

**Estimated Effort:** 2 days
**Estimated Value:** 5/10 (prevents data loss)
**Difficulty:** Medium

**Success Criteria:**
- ✅ Data versioning system implemented
- ✅ Migration functions work
- ✅ Old rosters still load correctly

---

#### **2.2 Comprehensive Documentation**

**Current State:**
- PRODUCT_OVERVIEW.md exists
- Missing architecture docs
- Code lacks comments
- Missing contribution guide

**What to Do:**
- Create `docs/` folder with:
  - ARCHITECTURE.md (how it all fits together)
  - GAME_MECHANICS.md (slots, skills, exclusive, etc.)
  - CONTRIBUTING.md (how to add features)
  - API.md (exported functions)
  - DATA_STRUCTURE.md (CSV format)
  - DEPLOYMENT.md (how to deploy)
  - ROADMAP.md (this becomes a living doc)
- Add code comments for complex sections

**Why It Matters:**
- Easier to come back to project later
- Enables community contributions
- Reduces support burden
- Professional project appearance

**Dependencies:**
- None

**Blocks:**
- Community contributions
- Future maintainability

**Estimated Effort:** 2-3 days
**Estimated Value:** 4/10 (helps long-term)
**Difficulty:** Easy

**Success Criteria:**
- ✅ docs/ folder with 6+ files
- ✅ README updated with links
- ✅ Complex functions commented

---

#### **2.3 Performance Optimization & Caching**

**Current State:**
- Combinations recalculated every time
- No memoization
- No service workers
- localStorage for everything

**COMPLETED:**
```
Week 1 (Jan 6-12):
  ✅ 1.1: Move expeditions to CSV (1 day actual)
  ✅ 1.2: Create gameRules.ts (1 day actual)

Week 2 (Jan 13-15):
  ✅ 1.3: Add Jest & tests (1 day actual)
  ✅ 1.3b: Cleanup "General Staff" misconception (1 day actual)
  ✅ 1.4: Set up CI/CD (1 day actual)
  
Week 3 (Jan 16):
  ✅ 1.5: Icon naming convention unified (1 day actual)
```

**UPCOMING:**
```
Week 3 (Jan 16-19):
  - 2.1: Data versioning (2 days)

Week 4 (Jan 20-26):
  - 2.2: Documentation (2-3 days)
  - 2.3: Performance optimization (2-3 days)
  - 2.4: Environment config (0.5 days)

Total Projected: ~1-2 weeks remaining for Mode 1 polish tasks
```

**Phase 1 Mode 1 Status: 100% COMPLETE** ✅
- ✅ All critical infrastructure items complete
- ✅ Ready to begin Mode 2 (Feature Development)

---

#### **2.4 Environment Configuration Setup**

**Current State:**
- No environment variables
- Hardcoded URLs/settings

**What to Do:**
- Create `.env.example` file
- Set up `.env.local` (development)
- Set up `.env.production` (deployed)
- Reference via `import.meta.env`

**Why It Matters:**
- Easy transition when you add backend
- Different settings for dev vs. production
- Safe handling of secrets

**Dependencies:**
- None

**Blocks:**
- Backend integration later

**Estimated Effort:** 0.5 days
**Estimated Value:** 3/10 (only needed if adding backend)
**Difficulty:** Easy

**Success Criteria:**
- ✅ .env files configured
- ✅ Code references env variables
- ✅ Different behavior in dev vs. prod

---

### Mode 1 Implementation Timeline

```
Week 1 (Jan 6-12): COMPLETE ✅
  ✅ 1.1: Move expeditions to CSV (1 day actual vs 3-4 days estimated)
  ✅ 1.2: Create gameRules.ts (1 day actual vs 1-2 days estimated)

Week 2 (Jan 13-15): COMPLETE ✅
  ✅ 1.3: Add Jest & tests (1 day actual vs 2-3 days estimated)
  ✅ 1.4: Set up CI/CD (1 day actual vs 1 day estimated)

Week 3 (Jan 16): COMPLETE ✅
  ✅ 1.5: Icon naming convention (1 day actual vs 2-3 days estimated)
  ✅ 1.6: Production deployment fix (0.5 day actual - rapid diagnosis + fix)

**Total Actual: 5.5 days (Week 1-3)**
**Total Estimated: 9-13 days**
**Mode 1 Complete: ~55% under estimated time** 🎉

All 6 critical infrastructure items done:
- CSV data loading ✅
- Centralized game rules ✅
- Automated testing (77 tests) ✅
- CI/CD pipeline ✅
- Unified asset naming (618 files) ✅
- Production deployment verified ✅

**Ready for Phase 2 (Feature Development)**
```

---

## Mode 2: Feature Development

### Priority Tier 1: HIGH VALUE (Do After Mode 1 Critical)

Features that unlock major value for users.

---

#### **3.1 Staff Optimizer (Phases A-C)**

**Current State:**
- No optimization at all
- Users manually plan rosters

**What to Do:**

**Phase A: Foundation (3-4 days)**
- Build slot exhaustion analyzer
  - Calculate slots used per expedition
  - Identify "locked" compositions
  - Create flexibility score (0-100%)
- Create configuration system
  - Preset modes (Perfectionist, Pragmatist, Efficient, Minimalist)
  - Custom preference toggles

**Phase B: Smart Allocation (2-3 days)**
- Implement skill allocation rules
- Respect non-expedition utility
- Avoid wasting slots on experts
- Route skills to ideal staff types

**Phase C: Multi-solution Optimizer (3-4 days)**
- Implement optimization algorithms
  - Greedy approach (fast)
  - Branch-and-bound (accurate)
- Generate multiple solutions
- Rank by different metrics
- Explain trade-offs

**Why It Matters:**
- CRITICAL for User D (Everything Museum)
- Enables smart roster planning for Users B & C
- Major UX improvement
- Directly addresses user needs

**Dependencies:**
- 1.1 (clean data)
- 1.2 (gameRules)
- 1.3 (tests to prove correctness)

**Blocks:**
- Multi-expedition planning

**Estimated Effort:** 8-10 days total (3 phases)
**Estimated Value:** 10/10 (game-changing)
**Difficulty:** Hard (complex algorithms)

**Success Criteria:**
- ✅ Slot exhaustion calculated correctly
- ✅ All 4 presets work
- ✅ Multiple solutions generated
- ✅ Tests prove correctness
- ✅ User can configure preferences

---

#### **3.2 Event Filtering System**

**Current State:**
- ExpeditionEvents.csv exists but unused
- Users can't customize what events matter to them
- Hardcoded "lump sum" requirements

**What to Do:**
- Parse ExpeditionEvents.csv fully
- Build event filter UI
  - Checkboxes for event types (Positive, Negative, Injury, MIA, etc.)
  - Checkboxes for event subtypes
  - Default: all selected (current behavior)
- Calculate flexible requirements
  - Only consider selected events
  - Drop requirements for skipped events
- Update matcher to use filtered requirements
- Re-evaluate expeditions dynamically

**Why It Matters:**
- Enables different playstyles (risk-takers vs. safe)
- Reduces training requirements for careful players
- Critical for User D's optimization choices
- Adds strategic depth

**Dependencies:**
- 1.1 (need events data loaded)
- 3.1 (optimizer should respect event filtering)

**Blocks:**
- Advanced risk-based optimization

**Estimated Effort:** 5-6 days
**Estimated Value:** 7/10 (enables flexibility)
**Difficulty:** Medium-Hard

**Success Criteria:**
- ✅ Event filter UI works
- ✅ Requirements updated dynamically
- ✅ Expeditions re-evaluate when filters change
- ✅ Backward compatible (all events selected = old behavior)

---

#### **3.3 Multi-Expedition Features**

**Current State:**
- Can only evaluate one expedition at a time
- No conflict detection
- No multi-select

**What to Do:**
- **Multi-select UI:** Select multiple expeditions
- **Conflict Detection:** 
  - Show if same person assigned to 2+ expeditions
  - Highlight conflicts visually
- **Staff Assignment Display:**
  - Show exactly who goes where
  - Allow manual override if wanted
- **Simultaneous Feasibility:**
  - Can all selected expeditions run at once?
- **Expedition Scheduling:**
  - Timeline view of assignments
  - Track who's busy vs. free

**Why It Matters:**
- Solves User C's main problem (conflict checking)
- Enables expedition planning
- Shows recommended staff combos
- High-value for users

**Dependencies:**
- 3.1 (optimizer should integrate with this)
- Staff assignment feature (from project analysis)

**Blocks:**
- Advanced scheduling

**Estimated Effort:** 6-7 days
**Estimated Value:** 8/10 (solves major pain point)
**Difficulty:** Medium

**Success Criteria:**
- ✅ Can select multiple expeditions
- ✅ Conflicts highlighted
- ✅ Staff assignments shown
- ✅ No false positives

---

### Priority Tier 2: GOOD-TO-HAVE (Do After Core Features)

Quality-of-life improvements and nice-to-have features.

---

#### **4.1 Staff Management Improvements**

**Current State:**
- Can't name staff
- No grouping by type
- Generic staff display

**What to Do:**
- **Name Staff:** 
  - Allow custom names (default to type + #)
  - Persist to localStorage
- **Collapse by Type:**
  - Group staff by type
  - Expandable/collapsible sections
  - Summary view (e.g., "3 Marine Life Experts")
- **Better UI:**
  - Show skills on each staff member
  - Visual skill level indicators
  - Highlight overutilized staff

**Why It Matters:**
- Better UX (easier to manage large rosters)
- Personal connection to staff
- Addresses user suggestions

**Dependencies:**
- None

**Blocks:**
- Nothing critical

**Estimated Effort:** 2-3 days
**Estimated Value:** 6/10 (nice-to-have)
**Difficulty:** Easy-Medium

**Success Criteria:**
- ✅ Can rename staff
- ✅ Can collapse/expand by type
- ✅ Names persist
- ✅ Summary shows totals

---

#### **4.2 Save/Load Filter Sets**

**Current State:**
- Filters reset on page reload
- Can't save preferred configurations

**What to Do:**
- Create filter configuration system
- Save button: "Save as preset"
- Load button: "Load preset"
- Manage presets: edit, delete, export
- Share presets as JSON

**Why It Matters:**
- Users can have multiple planning modes
- Reduces repetitive filtering
- Addresses user suggestion

**Dependencies:**
- 2.1 (data versioning helps here)

**Blocks:**
- Nothing critical

**Estimated Effort:** 2-3 days
**Estimated Value:** 5/10 (convenience feature)
**Difficulty:** Easy

**Success Criteria:**
- ✅ Can save filter configurations
- ✅ Can load saved configurations
- ✅ Can manage (edit, delete)
- ✅ Can export as JSON

---

#### **4.3 Save/Load Staff Rosters**

**Current State:**
- Staff persists in localStorage
- Can't explicitly save/load rosters
- Can't have multiple rosters

**What to Do:**
- Create roster management system
- Save button: "Save roster as..."
- List saved rosters with timestamps
- Load roster: restore staff + skills
- Compare rosters side-by-side
- Delete old rosters
- Export roster as JSON

**Why It Matters:**
- Users can compare different approaches
- Addresses user suggestion
- Essential for planning multiple "Everything Museums"

**Dependencies:**
- 2.1 (data versioning helps)

**Blocks:**
- Advanced what-if planning

**Estimated Effort:** 2-3 days
**Estimated Value:** 6/10 (planning capability)
**Difficulty:** Easy

**Success Criteria:**
- ✅ Can save multiple rosters
- ✅ Can load/switch between them
- ✅ Can compare side-by-side
- ✅ Can delete old rosters

---

#### **4.4 Stat Requirements (Future DLC)**

**Current State:**
- Only skills tracked
- Fantasy/Netherworld stats ignored

**What to Do:**
- Add stat tracking to staff members
- Parse stat requirements from events
- Match stats like skills
- Display stat indicators

**Why It Matters:**
- Complete DLC support
- Future-proof

**Dependencies:**
- ExpeditionEvents fully integrated
- 1.1 (data structure supports stats)

**Blocks:**
- Netherworld/Fantasy expedition support

**Estimated Effort:** 2-3 days
**Estimated Value:** 4/10 (DLC only)
**Difficulty:** Medium

**Success Criteria:**
- ✅ Stats tracked
- ✅ Requirements parsed
- ✅ Matching includes stats
- ✅ Tests cover stat matching

---

#### **4.5 Item Tracking (Future DLC)**

**Current State:**
- Items mentioned in ExpeditionEvents.csv
- Not tracked or matched

**What to Do:**
- Add item inventory to staff
- Parse item requirements from events
- Match items like skills
- Show item usage visualization

**Why It Matters:**
- Complete game support
- Addresses complex events

**Dependencies:**
- ExpeditionEvents fully integrated

**Blocks:**
- Advanced event support

**Estimated Effort:** 2-3 days
**Estimated Value:** 4/10 (niche)
**Difficulty:** Medium

**Success Criteria:**
- ✅ Items tracked
- ✅ Requirements recognized
- ✅ Matching includes items
- ✅ Visual feedback

---

#### **4.6 Seasonal Expeditions (Future)**

**Current State:**
- Some events are seasonal
- Not tracked in system

**What to Do:**
- Research seasonal mechanics
- Add season tracking
- Show seasonal availability
- Filter by season if desired

**Why It Matters:**
- Realistic game simulation
- Advanced planning

**Dependencies:**
- Research needed

**Blocks:**
- Realistic timeline planning

**Estimated Effort:** 3-4 days
**Estimated Value:** 3/10 (niche, advanced)
**Difficulty:** Medium

**Success Criteria:**
- ✅ Seasons tracked
- ✅ Expeditions filtered by season
- ✅ Timeline view shows seasonal patterns

---

### Mode 2 Implementation Timeline

```
Month 1 (After Mode 1):
  Week 1: 3.1 Phase A (Foundation)
  Week 2: 3.1 Phase B (Smart Allocation)
  Week 3: 3.1 Phase C (Optimizer)
  Week 4: 3.2 (Event Filtering)

Month 2:
  Week 1-2: 3.3 (Multi-Expedition)
  Week 3-4: 4.1 (Staff Management)

Month 3:
  Week 1-2: 4.2 (Filter Presets)
  Week 3-4: 4.3 (Roster Management)

Month 4+:
  4.4: Stats (if DLC work)
  4.5: Items (if DLC work)
  4.6: Seasons (if advanced)

Total: 3-4 months of Mode 2 feature development
```

---

## Master Timeline & Dependencies

```
Week 0 (Current):
  Planning & documentation ✅

PHASE 1 (Mode 1 Critical): 6.5 days ✅ COMPLETE
Week 1 (Jan 6-12): 1.1, 1.2 ✅
Week 2 (Jan 13-15): 1.3, 1.4 ✅
Week 3 (Jan 16): 1.5, 1.6, 1.7 ✅

PHASE 2 (Features): 4 months
Month 1: Optimizer (3.1) + Event Filtering (3.2)
Month 2: Multi-Expedition (3.3) + Staff UI (4.1)
Month 3: Save/Load Features (4.2, 4.3)
Month 4+: DLC support (4.4-4.6)

PHASE 3 (Polish & Scale): Ongoing
- Bug fixes
- Performance
- Community feedback
- DLC support
```

---

## Value vs. Effort Matrix

```
HIGH VALUE / LOW EFFORT (Do First):
  ✅ 1.2 (gameRules.ts)
  ✅ 1.4 (CI/CD)
  ✅ 4.1 (Staff UI)
  ✅ 4.2 (Filter Presets)

HIGH VALUE / MEDIUM EFFORT (Worth It):
  ✅ 1.1 (Move to CSV)
  ✅ 1.3 (Jest)
  ✅ 3.1 (Optimizer)
  ✅ 3.3 (Multi-Expedition)
  ✅ 4.3 (Roster Save/Load)

MEDIUM VALUE / MEDIUM EFFORT (If Time):
  ~ 2.1 (Data Versioning)
  ~ 3.2 (Event Filtering)
  ~ 2.3 (Caching)

LOW VALUE / HIGH EFFORT (Later):
  - 2.4 (Env Config - only if backend)
  - 4.4 (Stats - only if DLC)
  - 4.5 (Items - only if DLC)
  - 4.6 (Seasons - niche)
```

---

## Decision Points

### Should I do all Mode 1 first?

**Short answer: Not all, just the critical 3.**

```
CRITICAL (do before features):
  ✅ 1.1 (unblocks everything)
  ✅ 1.2 (needed for code clarity)
  ✅ 1.3 (needed before CI/CD)

IMPORTANT (but can interleave):
  ~ 1.4 (can do week 3)
  ~ 2.1-2.4 (do alongside features)
```

### What if I want to just add features?

**You'll feel pain.**

- Can't confidently refactor without tests
- Hard to make optimizer without gameRules
- Risk breaking things
- Not sustainable long-term

**Recommendation:** Bite the bullet, do 1.1-1.3 first (~2 weeks). Then 3.1 is way easier.

### What's the minimum viable product (MVP)?

**With the roadmap as-is:**

```
MVP: Core planner + basic optimizer
  Mode 1: 1.1, 1.2, 1.3 (2 weeks)
  Mode 2: 3.1 Phase A & B (1 week)
  
Leaves out: CI/CD, tests, docs, advanced features
Quick to market, but fragile
```

**Recommended:** Do 1.1-1.4, then 3.1 (3-4 weeks total).

---

## Document Status

**Phase 1 Status: ✅ COMPLETE (January 16, 2026)**
- All 7 critical infrastructure items implemented
- All data validated and in production
- All assets verified and deployed
- Ready for Phase 2 feature development

**Last Updated:** January 16, 2026 (1.7 Data & asset updates)  
**Next Phase:** Phase 2 Feature Development (Mode 2)  
**Next Review:** Before Phase 2 starts (3.1 Staff Optimizer)

### Mode 1 Success
- ✅ Code is clean, maintainable
- ✅ Tests pass reliably
- ✅ Documentation exists
- ✅ Confident to deploy
- ✅ Easy to add features

### Mode 2 Success
- ✅ Users can optimize rosters
- ✅ Event filtering works
- ✅ Multi-expedition planning works
- ✅ Users actively use new features
- ✅ Feedback is positive

---

## Open Questions

1. **Timeline pressure?** Do you have a deadline, or can you take 4 months?
2. **DLC scope?** Will you support Fantasy/Netherworld expeditions?
3. **Community?** Plan to allow community contributions?
4. **Backend?** Eventually want server/database?
5. **Priority?** Which user (A/B/C/D) matters most to you?

---

## Next Steps

**Immediate (Next meeting):**
- Decide: Do Mode 1 critical items first or jump to features?
- Decide: What's your timeline?
- Decide: Which features matter most?
- Get buy-in on implementation order

**After decision:**
- Pick Phase 1 work
- Start with 1.1 (Move expeditions)
- I help with implementation

---

**Document Status:** Ready for reference  
**Last Updated:** January 14, 2026  
**Next Review:** Before starting Phase 1 work
