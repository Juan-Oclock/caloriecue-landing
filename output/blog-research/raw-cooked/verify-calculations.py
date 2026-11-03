"""Reproduce article arithmetic from the recorded USDA values and stated assumptions."""
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).parent
records = json.loads((ROOT / 'usda-reference-values.json').read_text())
def kcal(fdc_id, grams):
    return Decimal(records[fdc_id]['kcal_per_100g']) * Decimal(grams) / 100
def rounded(value):
    return int(value.quantize(Decimal('1'), rounding=ROUND_HALF_UP))

results = {
    'rice_150g_raw_reference': kcal('168877', 150),
    'rice_150g_cooked_reference': kcal('168878', 150),
    'rice_entry_difference': kcal('168877', 150) - kcal('168878', 150),
    'rice_batch_200g_dry': kcal('168877', 200),
    'rice_portion_150_of_600g_batch': kcal('168877', 200) * 150 / 600,
    'pasta_140_of_280g_batch': Decimal(112) / 56 * 200 * 140 / 280,
    'pasta_140g_wrong_dry_entry': Decimal(140) / 56 * 200,
    'chicken_150g_cooked_reference': kcal('171477', 150),
    'chicken_150g_raw_reference': kcal('171077', 150),
    'chicken_entry_difference': kcal('171477', 150) - kcal('171077', 150),
    'mixed_dish_200g': Decimal(1600) * 200 / 1000,
    'mixed_dish_250g': Decimal(1600) * 250 / 1000,
    'mixed_dish_300g': Decimal(1600) * 300 / 1000,
}
expected = [548, 195, 353, 730, 183, 200, 500, 248, 180, 68, 320, 400, 480]
assert [rounded(v) for v in results.values()] == expected
assert Decimal(600) / 800 == Decimal('0.75')
assert Decimal(150) / 600 * 800 == 200
audit = {name: {'exact_kcal': str(v), 'display_kcal': rounded(v)} for name, v in results.items()}
(ROOT / 'calculation-audit.json').write_text(json.dumps(audit, indent=2) + '\n')
print('Verified all 13 displayed calorie calculations and both yield calculations.')
