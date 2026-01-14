# Implementation Log

## Phase 1.1: Move Expeditions to CSV

**Completed:** January 14, 2026  
**Duration:** Single session  
**Status:** ✅ COMPLETE

---

## What Was Built

### New Files Created

1. **`src/data/csvParser.ts`** (70 lines)
   - Generic CSV parser utility
   - Handles quoted fields, escaped quotes, newlines within fields
   - Reusable for any CSV file
   - Core function: `parseCSV(csvText: string): Record<string, string>[]`

2. **`src/data/dataValidator.ts`** (190 lines)
   - Validates all loaded data
   - Checks: skill names, staff types, numeric levels
   - Produces console report with ✅ or ❌ status
   - Non-breaking (warns but doesn't crash on validation issues)
   - Classes: `DataValidator` with methods for each validation type

3. **`src/data/loadExpeditions.ts`** (200 lines)
   - Main expedition loader
   - Fetches 5 CSV files in parallel:
     - Expeditions.csv (159 rows)
     - ExpeditionSkillRequirementsBaseOnly.csv (34 rows)
     - ExpeditionStaffRequirements.csv (287 rows)
     - ExpeditionEvents.csv (668 rows)
     - ExpeditionRewardTypes.csv (338 rows)
   - Parses, validates, and joins by expedition name
   - Returns fully structured Expedition[] with events and rewards
   - Async function: `loadExpeditionsFromCSV(): Promise<LoadedExpeditions>`

### Files Modified

1. **`src/types/index.ts`**
   - Added: `EventCounter` interface (skill/stat/rank/item counters)
   - Added: `Event` interface (id, name, type, subtype, counters)
   - Updated: `Expedition` interface to include `events: Event[]`
   - Changed: `rewards` from optional to required

2. **`src/App.tsx`**
   - Removed: `import { expeditions as expeditionsBase } from './data/expeditions'`
   - Removed: `import { parseRewardsCsv } from './data/loadRewards'`
   - Changed: Initial state from `expeditionsBase` to `[]` (loads on mount)
   - Updated: useEffect to call `loadExpeditionsFromCSV()` instead of `parseRewardsCsv()`
   - Result: Cleaner, consolidated loading

### Files Archived

1. **`src/data/expeditions.ts.backup`** (archived, then deleted)
   - Old hardcoded expedition data (950 lines)
   - No longer needed
   - Removed after verification

---

## Architecture

### Data Flow

```
App Startup
    ↓
loadExpeditionsFromCSV()
    ↓
Fetch 5 CSVs from /public/
    ↓
parseCSV() - Parse each into objects
    ↓
DataValidator - Check for errors
    ↓
Join by expedition name
    ↓
Build maps (by name, by map)
    ↓
Return Expedition[] to App
    ↓
setState(expeditions)
    ↓
UI renders with data
```

### Type Safety

```typescript
// Before: hardcoded, no events
const expeditionsBase: Expedition[] = [{...}]

// After: from CSV, with events
const expeditions: Expedition[] = [
  {
    name: "Darkest Depths",
    map: "Supernatural",
    skillRequirements: [...],
    staffRequirements: [...],
    events: [               // NEW!
      { id: 1, name: "Ghost Encounter", type: "Negative", ... }
    ],
    rewards: [              // NOW REQUIRED
      { name: "Spirit Essence", type: "Supernatural", ... }
    ]
  }
]
```

---

## Testing & Verification

### Build Tests
- ✅ TypeScript compilation: 0 errors
- ✅ Vite build: successful
- ✅ No import/export issues
- ✅ All types resolved

### Runtime Tests
- ✅ Dev server starts (npm run dev)
- ✅ App loads without errors
- ✅ All 159 expeditions load
- ✅ All 668 events load
- ✅ All 338 rewards load
- ✅ Staff adding/removing works
- ✅ Skill assignment works
- ✅ Feasibility checking works
- ✅ Filters work (map, reward, status)
- ✅ Rewards display with icons
- ✅ Data validation runs (console report)

### Data Integrity
- ✅ No expeditions lost
- ✅ No skills lost
- ✅ No staff requirements lost
- ✅ Events now available (were unused before)
- ✅ Rewards now properly mapped (fixed reward names vs. types)

---

## Key Decisions Made

### 1. CSV Structure (Normalized, not denormalized)
**Why:** Scalable, maintainable, follows database best practices
- One CSV per concept (expeditions, skills, staff, events, rewards)
- Each skill is one row (not columns)
- No duplication of expedition names
- Easy for non-coders to edit in Excel

### 2. Validation Layer (Non-breaking)
**Why:** Helps debug without crashing
- Warns if skill name doesn't exist
- Warns if staff type is invalid
- Prints console report
- App continues (graceful degradation)

### 3. Event Loading (All types, filter in UI)
**Why:** Future-proof
- Load all 668 events (Positive, Negative, Injury, Illness)
- Don't pre-filter
- UI can filter later (Phase 3.2: Event Filtering)

### 4. Async Loading (On startup)
**Why:** Consistent with current app behavior
- Fetch CSVs when App mounts
- Cache in React state
- No additional server needed

---

## What Unblocked

### Can Now Build (Phase 2):
1. **3.1: Staff Optimizer** - Has clean data structure, can analyze slots
2. **3.2: Event Filtering** - Events are now available
3. **3.3: Multi-Expedition** - Can iterate over Expedition objects
4. **4.1: Staff Management** - Cleaner code base

### Improvements Achieved:
- Single source of truth (CSVs, not hardcoded)
- Non-coders can edit data (Excel, no TypeScript needed)
- Data validated automatically
- Ready for DLC (stats, items, seasons)
- Better type safety (Event, EventCounter types)

---

## Performance Notes

- CSV parsing: ~5-10ms (parallel fetch, then parse)
- Validation: ~5ms (full scan)
- Data load: ~20-30ms total (not blocking)
- Memory: All 159 expeditions in memory (~1-2MB)
- No caching strategy yet (loads fresh each session)

---

## Next Steps (Phase 1.2)

After 1.1 verification → 1.2: Create `gameRules.ts`

This will centralize:
- All magic numbers (5-slot system, max skill level 3)
- All skill rules (exclusivity, restrictions)
- All staff type definitions
- Optimizer presets and settings
- Non-expedition skill utility scores

---

## Files Modified Summary

| File | Type | Change | Lines |
|------|------|--------|-------|
| csvParser.ts | New | CSV parser utility | +70 |
| dataValidator.ts | New | Data validation | +190 |
| loadExpeditions.ts | New | Main loader | +200 |
| types/index.ts | Modified | Added Event, EventCounter | +25 |
| App.tsx | Modified | Use CSV loader instead of hardcoded | -15 |
| expeditions.ts | Deleted | Removed hardcoded data | -950 |
| **Total** | | | **-520 net** |

Code is now **leaner, cleaner, and more maintainable**.

---

**Status:** Ready for Phase 1.2 (gameRules.ts)  
**Review Date:** Ready to proceed  
**Blockers:** None  
