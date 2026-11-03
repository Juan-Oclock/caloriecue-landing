# Publication notes — 3 November 2026

The approved 15-page design is retained. Three editable worked-example panels were added on pages 4, 11 and 12. The illustrative nutrition label now uses 8 g fat, 24 g carbohydrate, 8 g protein and 0 g fiber; the simplified 4/4/9 arithmetic totals 200 kcal. This is explicitly a fictional teaching label, not a package label. FDA guidance explains that real labels use nutrient-specific energy calculations and rounding, so their displayed macros need not sum exactly by simple arithmetic.

The 80 food rows were reviewed against the downloaded USDA FoodData Central SR Legacy April 2018 release, with explicit representative edible portion weights. The complete row-level calculations and FDC identifiers are in food-reference-audit.json and caloriecue-food-reference-sources.csv. All USDA estimates are rounded to the nearest 5 kcal, except values below 5 kcal. Four exceptions are documented: an unsweetened whole-milk latte recipe estimate, Almond Breeze unsweetened label, Coca-Cola example label, and Gold Peak sweet tea scaled from its published serving. These are representative examples, not claims about every brand.

Cooking state is made explicit, ground-meat servings are raw, and relevant metric/fluid-ounce notes are added. Packaged-food recipes and sizes vary; readers are directed to their own labels. Avocado uses a 75 g edible weight instead of an ambiguous half-medium fruit. Cereals now uses a specific corn-flake reference. Whey powder and protein bars use explicit gram weights.

Image resolution is unchanged: cover about 188 ppi at full A4 width, plate images about 388 and 300 ppi at their placed sizes. No artificial image enlargement or proportions changes. This is a digital-first guide that can be printed, not a 300-ppi press-production package.

Sources checked:
- USDA source release: https://fdc.nal.usda.gov/download-datasets/
- FDA label reading: https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label
- FDA rounding/calculation guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-guide-developing-and-using-data-bases-nutrition-labeling
- Almond Breeze: https://almondbreeze.ca/products/refrigerated/original-unsweetened/
- Coca-Cola: https://www.coca-cola.com/us/en/brands/coca-cola/products/original?redirect=true
- Gold Peak: https://www.coca-cola.com/us/en/brands/gold-peak-tea/gold-peak-products

Editorial refinements were applied to the exported editable source while Claude Design was usage-limited. The release source package is authoritative for this edition; the earlier Claude canvas is an earlier design checkpoint until the final HTML is re-imported.
