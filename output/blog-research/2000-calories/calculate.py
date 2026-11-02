"""Recheck the example day from the official SR Legacy JSON download.

Usage: python3 output/blog-research/2000-calories/calculate.py /path/to/sr-legacy.zip
"""
import json
import sys
import zipfile
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

OUT = Path(__file__).parent
MEALS = [
    ("Breakfast", [(173904, 60), (170894, 170), (173944, 100), (174294, 16)]),
    ("Lunch", [(171477, 120), (168878, 180), (169967, 150), (171413, 10)]),
    ("Snack", [(171688, 180), (170567, 25)]),
    ("Dinner", [(175168, 150), (170093, 250), (170394, 150), (171413, 10)]),
]
NUTRIENTS = {"kcal": 1008, "protein": 1003, "carbs": 1005, "fat": 1004, "fiber": 1079}

def rounded(value, places="1"):
    return float(value.quantize(Decimal(places), rounding=ROUND_HALF_UP))

with zipfile.ZipFile(sys.argv[1]) as archive:
    dataset = json.loads(archive.read(next(n for n in archive.namelist() if n.endswith(".json"))))
foods = {f["fdcId"]: f for f in dataset["SRLegacyFoods"]}
used = sorted({fdc_id for _, items in MEALS for fdc_id, _ in items})
references = {}
for fdc_id in used:
    food = foods[fdc_id]
    nutrients = {n["nutrient"]["id"]: n["amount"] for n in food["foodNutrients"]}
    references[fdc_id] = {
        "description": food["description"],
        "source": f"https://fdc.nal.usda.gov/food-details/{fdc_id}/nutrients",
        "per100g": {key: nutrients[value] for key, value in NUTRIENTS.items()},
    }
report = {"source": "USDA FoodData Central SR Legacy April 2018 JSON", "checked": "2026-11-02", "references": references, "meals": []}
day = {key: Decimal(0) for key in NUTRIENTS}
for name, items in MEALS:
    total = {key: Decimal(0) for key in NUTRIENTS}
    rows = []
    for fdc_id, grams in items:
        nutrients = {key: Decimal(str(value)) * Decimal(grams) / 100 for key, value in references[fdc_id]["per100g"].items()}
        rows.append({"fdcId": fdc_id, "grams": grams, **{key: float(value) for key, value in nutrients.items()}})
        total = {key: total[key] + nutrients[key] for key in NUTRIENTS}
    day = {key: day[key] + total[key] for key in NUTRIENTS}
    meal = {"name": name, "foods": rows, "totals": {key: float(value) for key, value in total.items()}, "displayKcal": int(rounded(total["kcal"]))}
    report["meals"].append(meal)
    print(name, meal["displayKcal"], {key: rounded(value, "0.1") for key, value in total.items()})
report["day"] = {key: float(value) for key, value in day.items()}
report["displayDayKcal"] = int(rounded(day["kcal"]))
assert report["displayDayKcal"] == 2004
assert sum(m["displayKcal"] for m in report["meals"]) == 2004
(OUT / "nutrition-audit.json").write_text(json.dumps(report, indent=2) + "\n")
print("DAY", {key: rounded(value, "0.1") for key, value in day.items()})
