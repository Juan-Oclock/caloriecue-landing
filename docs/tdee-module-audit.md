# TDEE Module Audit

**Purpose:** Survey the existing `src/lib/tdee/` module before building the landing-page calculator adapter, so we extend the module in place rather than creating a parallel one.
**Spec reference:** `caloriecue-landing-v1-spec.md` §4.1.
**Audit date:** 2026-05-28.

---

## 1. Files

```
src/lib/tdee/
├── constants.ts   (45 lines)
├── formulas.ts    (170 lines)
└── types.ts       (62 lines)
```

No `index.ts` barrel; consumers import directly from each file.

---

## 2. Types (`types.ts`)

| Export | Definition | Notes |
|---|---|---|
| `Gender` | `"male" \| "female"` | Spec said "use Gender (not Sex)" — confirmed |
| `UnitSystem` | `"imperial" \| "metric"` | |
| `ActivityLevel` | `"sedentary" \| "light" \| "moderate" \| "very_active" \| "extreme"` | Exactly the union the spec predicted |
| `MacroPlan` | `"balanced" \| "low_carb" \| "high_carb"` | Used by full calc only; landing v1 has no carb/fat split |
| `GoalType` | `"cut" \| "maintain" \| "bulk"` | **Existing TDEE goal vocabulary — only 3 values.** Landing's `Goal` will have 4 (lose-weight, build-muscle, maintain, gain-weight) and lives in the adapter |
| `UserInputs`, `BMRResults`, `TDEEResults`, `MacroBreakdownResult`, `WeeklyDataPoint`, `IdealWeightResult`, `ActivityBreakdownItem` | Result shapes used by the full /tdee-calculator page | Not consumed by the landing adapter |

**Decision row #13 (activity-level labels) — resolution:** Use `ACTIVITY_LABELS[level].title` from `constants.ts` so the inline calculator's labels match the full `/tdee-calculator` exactly. Will mark row #13 resolved in the Decision Log when this PR lands.

---

## 3. Constants (`constants.ts`)

| Export | What | Notes |
|---|---|---|
| `ACTIVITY_MULTIPLIERS` | `{sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extreme: 1.9}` | Standard textbook Mifflin multipliers |
| `ACTIVITY_LABELS` | `{title, description}` per level — full descriptive labels | **Use these in the inline calculator** (resolves Decision #13) |
| `MACRO_PRESETS` | Percent splits per `MacroPlan` | Not used by landing v1 |
| `GOAL_OFFSETS` | `{cut: -500, maintain: 0, bulk: +500}` | Only 3 keys — does not directly cover landing's 4 goals; see Decision Q1 below |
| `BMI_CATEGORIES`, `MEAL_SPLIT` | Display-only for the full calc | Not used by landing v1 |

---

## 4. Formulas (`formulas.ts`)

### Unit converters
| Function | Signature |
|---|---|
| `lbsToKg(lbs)` | → `number` |
| `kgToLbs(kg)` | → `number` |
| `feetInchesToCm(feet, inches)` | → `number` |
| `cmToFeetInches(cm)` | → `{feet, inches}` |

### BMR
| Function | Signature |
|---|---|
| `calculateBMR_MifflinStJeor(weightKg, heightCm, age, gender)` | → `number` (raw kcal, unrounded) |
| `calculateBMR_HarrisBenedict(weightKg, heightCm, age, gender)` | → `number` |
| `calculateBMR_KatchMcArdle(weightKg, bodyFatPercent)` | → `number` |

**Mifflin-St Jeor formula verification.**
Source: Mifflin et al., 1990. *Am J Clin Nutr* 51(2):241-7.
- Male: `10w + 6.25h − 5a + 5`
- Female: `10w + 6.25h − 5a − 161`

Code at `formulas.ts:32-34` matches the textbook exactly. **No drift.**

Sanity check (30yo male, 80kg, 180cm):
`10×80 + 6.25×180 − 5×30 + 5 = 800 + 1125 − 150 + 5 = 1780` ✓ (matches spec's "~1780").

Sanity check (30yo female, 65kg, 165cm):
`10×65 + 6.25×165 − 5×30 − 161 = 650 + 1031.25 − 150 − 161 = 1370.25`
Spec mentioned "~1395" — this is **off by ~25 kcal vs spec's hint**. The code matches the textbook formula precisely, so the spec's hint is what's off, not the code. Will use 1370 as the assertion in the regression test.

### TDEE / BMI
| Function | Signature |
|---|---|
| `calculateTDEE(bmr, activityLevel)` | → `Math.round(bmr × multiplier)` |
| `calculateBMI(weightKg, heightCm)` | → `number` (unrounded) |
| `getBMICategory(bmi)` | → `{label, color, bg}` |

### Macros (full calculator only)
| Function | Signature |
|---|---|
| `calculateMacros(calories, plan)` | → `MacroBreakdownResult` (protein/carbs/fat grams + calories) |

### Other (full calculator only)
| Function | Signature |
|---|---|
| `calculateIdealWeight(heightCm, gender)` | → `IdealWeightResult[]` (4 formulas) |
| `calculateActivityBreakdown(bmr, currentLevel)` | → `ActivityBreakdownItem[]` |
| `calculateAll(...)` | → `TDEEResults` (BMR, TDEE, BMI, goals.{cut,maintain,bulk}) |
| `calculateWeeklyProjection(currentWeightKg, tdee, targetCalories, weeks?)` | → `WeeklyDataPoint[]` |

### Missing (must be added per spec §4.1)
- **`calculateProteinRangeGrams(weightKg: number): [number, number]`** — returns `[1.6 × weightKg, 2.2 × weightKg]` rounded. Used by inline calculator for the protein range line.
- **`calculateGoalCalories(tdee, goal)` / `getGoalPaceLabel(goal)`** — spec suggests adding these to the TDEE module if missing. Recommendation below: keep these in the **landing adapter** instead, because they encode landing's 4-goal vocabulary and would force the existing TDEE module to reach across vocabularies (`GoalType` cut/maintain/bulk vs landing `Goal`).

---

## 5. Consumers

All 11 consumers live under `src/app/tdee-calculator/` or `src/components/tdee/`:

| File | Imports |
|---|---|
| `src/app/tdee-calculator/TDEECalculatorClient.tsx` | types + `calculateMacros`, `calculateWeeklyProjection`, `getBMICategory`, `calculateIdealWeight`, `calculateActivityBreakdown` |
| `src/components/tdee/WeeklyProjection.tsx` | `WeeklyDataPoint`, `UnitSystem`, `kgToLbs` |
| `src/components/tdee/MacroBreakdown.tsx` | `MacroBreakdownResult`, `MacroPlan`, `MACRO_PRESETS` |
| `src/components/tdee/ResultsDashboard.tsx`, `ResultsPage.tsx` | Aggregate result-page imports |
| `src/components/tdee/steps/StepBasics.tsx`, `StepMeasurements.tsx`, `StepLifestyle.tsx` | Form-step types (Gender / UnitSystem / ActivityLevel) |
| `src/components/tdee/results/DetailedMetrics.tsx`, `MealPlanSection.tsx`, `OutcomeContext.tsx` | Display result shapes + `MEAL_SPLIT`, `BMI_CATEGORIES` |

**No consumers outside the TDEE feature.** Adding `calculateProteinRangeGrams` and JSDoc citations is purely additive and cannot break existing call sites. The existing `/tdee-calculator` page should not need any code changes.

---

## 6. Math drift check

The existing `calculateBMR_MifflinStJeor` and `calculateTDEE` match the textbook references exactly. **No silent divergence**; nothing here requires Juan to make a "correct existing math vs preserve current UX" call.

---

## 7. Decisions to confirm before writing the adapter

These came up during discovery and are not covered by the spec's locked rows. Surfacing per spec §4.1 ambiguity protocol; will append rows to the Decision Log in §10 once Juan resolves.

### Q1 — Calorie offset for `build-muscle` (landing's 4-goal vocabulary → kcal)
The existing `GOAL_OFFSETS` only covers 3 goals (`cut: −500, maintain: 0, bulk: +500`). Landing has 4 (`lose-weight, build-muscle, maintain, gain-weight`).

**Recommendation:** in the **landing adapter** (not the TDEE module), define:
- `lose-weight` → TDEE − 500
- `maintain` → TDEE
- `build-muscle` → TDEE + 250 (modest lean surplus — standard fitness-literature recommendation; minimizes fat gain)
- `gain-weight` → TDEE + 500 (matches existing `bulk` offset)

This keeps the existing TDEE module's `GOAL_OFFSETS` untouched (so `/tdee-calculator` is unaffected) and encodes the 4→3 mapping in the landing-specific adapter where it belongs.

### Q2 — `goalPaceLabel` per goal (plain-language text in result)
**Recommendation:**
- `lose-weight` → "Lose ~1 lb / 0.45 kg per week"
- `build-muscle` → "Gain ~0.5 lb / 0.25 kg per week (lean surplus)"
- `maintain` → "Maintain current weight"
- `gain-weight` → "Gain ~1 lb / 0.45 kg per week"

### Q3 — `nextStepText` per goal
The spec gives one example: *"Track your meals for 7 days and adjust from your weekly average."*

**Recommendation:** use **one shared text** for all four goals (the spec's example, verbatim). It's true for every goal, simpler to maintain, and avoids drift. We can vary per goal later if needed.

### Q4 — Protein range
**Recommendation:** uniform 1.6–2.2 g/kg across all 4 goals per spec. Don't vary by goal in v1.

### Q5 — Edge-case behavior for non-positive inputs
Spec leaves it open ("throw or safe default; decide which and document").

**Recommendation:** the formula helpers (`calculateBMR_MifflinStJeor` etc.) **do not validate** — they're pure math, called only from controlled sites. Validation belongs in the adapter (`getHomepageCalculatorResult`), which throws a typed error on invalid inputs (age ≤ 0, weight ≤ 0, height ≤ 0). JSDoc on the formula helpers will say "caller must pass positive finite numbers." This preserves the existing module's behavior (the full calculator already trusts its inputs) and centralizes new validation in the new code.

### Q6 — Spec's Mifflin sanity reference for the female case (~1395)
Spec says "30yo female, 65kg, 165cm → ~1395 kcal." Textbook formula produces **1370.25**. The code matches the textbook exactly.

**Recommendation:** assert against the textbook value (1370) in the regression test. The spec's hint was approximate. Not a code change.

---

## 8. Plan for the adapter PR (post-confirmation)

Once Q1–Q5 are confirmed:

1. **Extend the TDEE module in place** — add JSDoc with the Mifflin citation to `formulas.ts`. Add `calculateProteinRangeGrams(weightKg)` to `formulas.ts` (additive, no consumer impact).
2. **Add regression tests** at `src/lib/tdee/__tests__/formulas.test.ts` covering current Mifflin / TDEE / activity-multiplier behavior plus the new protein function.
3. **Create the landing adapter** at `src/lib/landing/calculator.ts` exporting `Goal`, `HomepageCalculatorInput`, `HomepageCalculatorResult`, and `getHomepageCalculatorResult(input)`. The adapter holds the 4→3 goal mapping (Q1), the pace labels (Q2), the next-step text (Q3), and input validation (Q5).
4. **Add adapter tests** at `src/lib/landing/__tests__/calculator.test.ts` per spec's acceptance criteria.

**Files not changed:** anything under `src/app/tdee-calculator/` or `src/components/tdee/`. The existing page consumes the same module and should produce identical numbers; the regression tests above are the guard.
