import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { publicAsset, registerFonts } from "@/lib/cheat-sheet/assets";
import {
  carbFoods,
  fatFoods,
  logDays,
  mealExamples,
  mixedFoods,
  proteinFoods,
  type MacroFood,
  type MacroTotals,
  type MealExample,
} from "./data";

registerFonts();

const logo =
  publicAsset("caloriecue_logo.png") ?? publicAsset("app-icons/1024.png");
const appMockup = publicAsset("mockup-caloriecue.png");

const colors = {
  brand: "#E05A3A",
  brandDark: "#B94329",
  brandSoft: "#FFF1EB",
  ink: "#191919",
  gray: "#667085",
  faint: "#98A2B3",
  line: "#E9E4E1",
  row: "#FBFAF9",
  protein: "#C94268",
  carb: "#2E69C7",
  fat: "#A56A00",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 40,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8.5,
    color: colors.ink,
  },
  cover: {
    padding: 48,
    fontFamily: "Inter",
    fontWeight: 500,
    color: colors.ink,
    backgroundColor: "#FFFCFA",
  },
  coverAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 190,
    height: 230,
    backgroundColor: colors.brandSoft,
    borderBottomLeftRadius: 110,
  },
  coverBrand: { flexDirection: "row", alignItems: "center" },
  coverLogo: { width: 34, height: 34, borderRadius: 9, marginRight: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.brand,
    color: colors.white,
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 6,
    marginRight: 10,
  },
  coverBrandName: { fontSize: 14, fontWeight: 700 },
  coverKicker: {
    marginTop: 115,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    color: colors.brand,
  },
  coverTitle: {
    marginTop: 12,
    width: 430,
    fontSize: 37,
    fontWeight: 700,
    lineHeight: 1.05,
  },
  coverSubtitle: {
    fontFamily: "Helvetica",
    marginTop: 18,
    width: 430,
    fontSize: 12,
    lineHeight: 1.55,
    color: colors.gray,
  },
  pills: { marginTop: 25, flexDirection: "row", flexWrap: "wrap" },
  pill: {
    fontFamily: "Helvetica",
    marginRight: 7,
    marginBottom: 7,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0CBBE",
    color: colors.brandDark,
    fontSize: 8,
    fontWeight: 700,
  },
  coverFooter: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverFooterText: { fontFamily: "Helvetica", color: colors.gray, fontSize: 9, fontWeight: 700 },
  masthead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mastheadBrand: { flexDirection: "row", alignItems: "center" },
  mastheadLogo: { width: 17, height: 17, borderRadius: 4, marginRight: 6 },
  mastheadFallback: {
    width: 17,
    height: 17,
    borderRadius: 4,
    marginRight: 6,
    paddingTop: 3,
    color: colors.white,
    backgroundColor: colors.brand,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 8,
  },
  mastheadName: { fontWeight: 700, fontSize: 9 },
  sheetLabel: { color: colors.faint, fontSize: 7, letterSpacing: 1.2 },
  pageTitle: { marginTop: 10, fontSize: 19, fontWeight: 700, color: colors.brand },
  pageIntro: { fontFamily: "Helvetica", marginTop: 3, color: colors.gray, lineHeight: 1.45, maxWidth: 500 },
  rule: { height: 2, backgroundColor: colors.brand, marginTop: 9, marginBottom: 12 },
  footer: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 18,
    borderTopWidth: 0.7,
    borderTopColor: colors.line,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontFamily: "Helvetica", color: colors.faint, fontSize: 7 },
  sectionTitle: {
    color: colors.brandDark,
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    marginTop: 9,
  },
  card: {
    borderWidth: 0.8,
    borderColor: colors.line,
    borderRadius: 7,
    padding: 10,
    backgroundColor: colors.row,
  },
  equationRow: { flexDirection: "row", marginBottom: 12 },
  equationCard: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
  },
  equationCardLast: { marginRight: 0 },
  equationMacro: { fontSize: 10, fontWeight: 700, marginBottom: 5 },
  equationValue: { fontSize: 20, fontWeight: 700, color: colors.brandDark },
  targetGrid: { flexDirection: "row", flexWrap: "wrap" },
  target: {
    width: "48.5%",
    marginRight: "1.5%",
    marginBottom: 8,
    borderWidth: 0.8,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 9,
  },
  targetLabel: { fontWeight: 700, marginBottom: 12 },
  targetLine: { borderBottomWidth: 0.8, borderBottomColor: colors.gray },
  workedExample: { flexDirection: "row", marginTop: 5 },
  workedText: { fontFamily: "Helvetica", flex: 1, lineHeight: 1.55, color: colors.gray },
  workedTotal: {
    width: 145,
    padding: 10,
    marginLeft: 10,
    borderRadius: 7,
    backgroundColor: colors.brandSoft,
  },
  workedTotalLabel: { fontFamily: "Helvetica", fontSize: 8, color: colors.gray },
  workedTotalValue: { fontSize: 15, fontWeight: 700, color: colors.brandDark, marginTop: 3 },
  flow: { flexDirection: "row", marginTop: 3 },
  flowStep: { flex: 1, paddingRight: 8 },
  flowNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand,
    color: colors.white,
    textAlign: "center",
    paddingTop: 4,
    fontWeight: 700,
    marginBottom: 4,
  },
  flowTitle: { fontWeight: 700, fontSize: 8.5, marginBottom: 2 },
  flowCopy: { fontFamily: "Helvetica", color: colors.gray, fontSize: 7.5, lineHeight: 1.4 },
  table: { borderWidth: 0.7, borderColor: colors.line, borderRadius: 5, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: colors.brandSoft },
  tableHeaderText: { paddingVertical: 4, paddingHorizontal: 4, fontSize: 6.8, fontWeight: 700 },
  tableRow: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: colors.line },
  tableRowAlt: { backgroundColor: colors.row },
  tableText: { fontFamily: "Helvetica", paddingVertical: 2.5, paddingHorizontal: 4, fontSize: 7.1 },
  foodCol: { width: 104 },
  servingCol: { flex: 1 },
  numberCol: { width: 43, textAlign: "right" },
  markerCol: { width: 23, textAlign: "center" },
  efficient: { color: colors.brandDark, fontWeight: 700 },
  legend: { fontFamily: "Helvetica", color: colors.gray, fontSize: 7, marginTop: 6, lineHeight: 1.35 },
  compactSections: { flexDirection: "row" },
  compactCol: { flex: 1 },
  compactColLeft: { marginRight: 8 },
  compactTableText: { fontFamily: "Helvetica", paddingVertical: 1.6, paddingHorizontal: 3, fontSize: 6.2 },
  compactFoodCol: { width: 79 },
  compactServingCol: { flex: 1 },
  compactNumberCol: { width: 27, textAlign: "right" },
  mixedStrip: { marginTop: 8 },
  mixedGrid: { flexDirection: "row", flexWrap: "wrap" },
  mixedItem: {
    width: "24%",
    marginRight: "1%",
    marginBottom: 4,
    borderWidth: 0.6,
    borderColor: colors.line,
    borderRadius: 4,
    padding: 5,
    backgroundColor: colors.row,
  },
  mixedName: { fontSize: 6.6, fontWeight: 700 },
  mixedMacros: { fontFamily: "Helvetica", marginTop: 2, color: colors.gray, fontSize: 5.9 },
  stepRow: { flexDirection: "row", marginBottom: 9 },
  stepCard: {
    flex: 1,
    marginRight: 6,
    padding: 7,
    borderRadius: 6,
    backgroundColor: colors.brandSoft,
  },
  stepCardLast: { marginRight: 0 },
  stepNumber: { color: colors.brand, fontWeight: 700, fontSize: 7 },
  stepTitle: { fontWeight: 700, fontSize: 8, marginTop: 2 },
  stepCopy: { fontFamily: "Helvetica", fontSize: 6.7, color: colors.gray, lineHeight: 1.35, marginTop: 2 },
  mealRow: { flexDirection: "row" },
  mealCard: {
    flex: 1,
    marginRight: 7,
    borderWidth: 0.7,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 8,
  },
  mealCardLast: { marginRight: 0 },
  mealTitle: { color: colors.brandDark, fontSize: 8.5, fontWeight: 700, marginBottom: 5 },
  mealItem: { fontFamily: "Helvetica", color: colors.gray, fontSize: 6.6, lineHeight: 1.45 },
  totalsRow: {
    flexDirection: "row",
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 0.6,
    borderTopColor: colors.line,
  },
  totalChip: { flex: 1, fontSize: 6.4, fontWeight: 700, textAlign: "center" },
  proteinText: { color: colors.protein },
  carbText: { color: colors.carb },
  fatText: { color: colors.fat },
  mealPlanRow: { flexDirection: "row", marginTop: 10 },
  mealPlanBox: {
    flex: 1,
    height: 104,
    marginRight: 9,
    padding: 9,
    borderWidth: 0.8,
    borderColor: colors.gray,
    borderRadius: 6,
  },
  mealPlanBoxLast: { marginRight: 0 },
  mealPlanTitle: { fontWeight: 700, marginBottom: 8 },
  writeLine: { height: 20, borderBottomWidth: 0.6, borderBottomColor: colors.line },
  logTable: { borderWidth: 0.8, borderColor: colors.line, borderRadius: 6, overflow: "hidden" },
  logHeader: { flexDirection: "row", backgroundColor: colors.brand },
  logHeaderText: { color: colors.white, paddingVertical: 5, paddingHorizontal: 3, fontSize: 7, fontWeight: 700, textAlign: "center" },
  logRow: { flexDirection: "row", borderTopWidth: 0.6, borderTopColor: colors.line },
  logDay: { width: 58, minHeight: 48, padding: 5, fontWeight: 700, color: colors.brandDark, backgroundColor: colors.brandSoft },
  logNumber: { width: 62, minHeight: 48, borderLeftWidth: 0.5, borderLeftColor: colors.line },
  logNotes: { flex: 1, minHeight: 48, borderLeftWidth: 0.5, borderLeftColor: colors.line },
  averages: { flexDirection: "row", marginTop: 9 },
  averageField: { flex: 1, marginRight: 7 },
  averageFieldLast: { marginRight: 0 },
  averageLabel: { fontSize: 7, fontWeight: 700 },
  averageLine: { height: 17, borderBottomWidth: 0.8, borderBottomColor: colors.gray },
  consistency: { fontFamily: "Helvetica", marginTop: 12, color: colors.gray, lineHeight: 1.45 },
  cta: {
    marginTop: 10,
    minHeight: 92,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.brandSoft,
    borderWidth: 0.8,
    borderColor: "#F0CBBE",
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: { flex: 1, paddingRight: 12 },
  ctaTitle: { fontSize: 11, fontWeight: 700, color: colors.brandDark },
  ctaCopy: { fontFamily: "Helvetica", marginTop: 4, color: colors.gray, lineHeight: 1.4 },
  ctaUrl: { marginTop: 7, fontWeight: 700, color: colors.brand },
  ctaImage: { width: 48, height: 86, objectFit: "contain" },
});

function PageHeader({ title, intro, sheet }: { title: string; intro: string; sheet: string }) {
  return (
    <>
      <View style={styles.masthead}>
        <View style={styles.mastheadBrand}>
          {logo ? <Image src={logo} style={styles.mastheadLogo} /> : <Text style={styles.mastheadFallback}>C</Text>}
          <Text style={styles.mastheadName}>CalorieCue</Text>
        </View>
        <Text style={styles.sheetLabel}>{sheet}</Text>
      </View>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageIntro}>{intro}</Text>
      <View style={styles.rule} />
    </>
  );
}

function Footer({ page }: { page: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>caloriecue.app · Macro Tracking Cheat Sheet</Text>
      <Text style={styles.footerText}>{page} / 6</Text>
    </View>
  );
}

function MacroTotalsRow({ totals }: { totals: MacroTotals }) {
  return (
    <View style={styles.totalsRow}>
      <Text style={styles.totalChip}>{totals.calories} kcal</Text>
      <Text style={[styles.totalChip, styles.proteinText]}>P {totals.protein}g</Text>
      <Text style={[styles.totalChip, styles.carbText]}>C {totals.carbs}g</Text>
      <Text style={[styles.totalChip, styles.fatText]}>F {totals.fat}g</Text>
    </View>
  );
}

function MacroTable({ foods, compact = false, efficiency = false }: { foods: MacroFood[]; compact?: boolean; efficiency?: boolean }) {
  const textStyle = compact ? styles.compactTableText : styles.tableText;
  const foodStyle = compact ? styles.compactFoodCol : styles.foodCol;
  const servingStyle = compact ? styles.compactServingCol : styles.servingCol;
  const numberStyle = compact ? styles.compactNumberCol : styles.numberCol;
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, foodStyle]}>Food</Text>
        <Text style={[styles.tableHeaderText, servingStyle]}>Preparation / serving</Text>
        <Text style={[styles.tableHeaderText, numberStyle]}>kcal</Text>
        <Text style={[styles.tableHeaderText, numberStyle, styles.proteinText]}>P g</Text>
        <Text style={[styles.tableHeaderText, numberStyle, styles.carbText]}>C g</Text>
        <Text style={[styles.tableHeaderText, numberStyle, styles.fatText]}>F g</Text>
        {efficiency ? <Text style={[styles.tableHeaderText, styles.markerCol]}>Eff.</Text> : null}
      </View>
      {foods.map((food, index) => {
        const efficient = food.protein / food.calories >= 0.1;
        return (
          <View key={`${food.name}-${food.serving}`} style={[styles.tableRow, index % 2 ? styles.tableRowAlt : {}]} wrap={false}>
            <Text style={[textStyle, foodStyle, { fontWeight: 700 }]}>{food.name}</Text>
            <Text style={[textStyle, servingStyle]}>{food.serving}</Text>
            <Text style={[textStyle, numberStyle]}>{food.calories}</Text>
            <Text style={[textStyle, numberStyle, styles.proteinText]}>{food.protein}</Text>
            <Text style={[textStyle, numberStyle, styles.carbText]}>{food.carbs}</Text>
            <Text style={[textStyle, numberStyle, styles.fatText]}>{food.fat}</Text>
            {efficiency ? <Text style={[textStyle, styles.markerCol, efficient ? styles.efficient : {}]}>{efficient ? "E" : ""}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function MacroCoverPage({ logo: coverLogo }: { logo: string | null }) {
  const pills = ["Protein foods", "Carb foods", "Fat foods", "Meal builder", "7-day log"];
  return (
    <Page size="LETTER" style={styles.cover}>
      <View style={styles.coverAccent} />
      <View style={styles.coverBrand}>
        {coverLogo ? <Image src={coverLogo} style={styles.coverLogo} /> : <Text style={styles.brandMark}>C</Text>}
        <Text style={styles.coverBrandName}>CalorieCue</Text>
      </View>
      <Text style={styles.coverKicker}>PRINTABLE REFERENCE</Text>
      <Text style={styles.coverTitle}>Macro Tracking Cheat Sheet</Text>
      <Text style={styles.coverSubtitle}>Protein, carb and fat food lists, meal-building examples, and a printable 7-day macro log</Text>
      <View style={styles.pills}>
        {pills.map((pill) => <Text key={pill} style={styles.pill}>{pill}</Text>)}
      </View>
      <View style={styles.coverFooter}>
        <Text style={styles.coverFooterText}>caloriecue.app</Text>
        <Text style={styles.coverFooterText}>5 printable sheets + cover</Text>
      </View>
    </Page>
  );
}

function MacroQuickStartPage() {
  const targets = ["Daily calories", "Protein (P)", "Carbohydrates (C)", "Fat (F)"];
  const steps = [
    ["Anchor protein", "Choose a protein serving that supports your target."],
    ["Add preferences", "Fill carbohydrates and fats around training, hunger, and foods you enjoy."],
    ["Count the full food", "Mixed foods contribute more than their dominant macro."],
    ["Review the week", "Use averages; one imperfect day does not define consistency."],
  ];
  return (
    <Page size="LETTER" style={styles.page}>
      <PageHeader title="Macro quick start" intro="Use your own targets. This sheet organizes foods and meals; it does not prescribe a universal macro ratio." sheet="PRINTABLE SHEET 1" />
      <Text style={styles.sectionTitle}>The 4 / 4 / 9 calorie equation</Text>
      <View style={styles.equationRow}>
        <View style={styles.equationCard}><Text style={styles.equationMacro}>P · Protein</Text><Text style={styles.equationValue}>4 kcal / g</Text></View>
        <View style={styles.equationCard}><Text style={styles.equationMacro}>C · Carbohydrate</Text><Text style={styles.equationValue}>4 kcal / g</Text></View>
        <View style={[styles.equationCard, styles.equationCardLast]}><Text style={styles.equationMacro}>F · Fat</Text><Text style={styles.equationValue}>9 kcal / g</Text></View>
      </View>
      <Text style={styles.sectionTitle}>My daily targets</Text>
      <View style={styles.targetGrid}>{targets.map((target) => <View key={target} style={styles.target}><Text style={styles.targetLabel}>{target}</Text><View style={styles.targetLine} /></View>)}</View>
      <Text style={styles.sectionTitle}>Worked example: grams to calories</Text>
      <View style={styles.card}>
        <View style={styles.workedExample}>
          <Text style={styles.workedText}>150g P × 4 = 600 kcal{"\n"}200g C × 4 = 800 kcal{"\n"}70g F × 9 = 630 kcal</Text>
          <View style={styles.workedTotal}><Text style={styles.workedTotalLabel}>Reconciled daily total</Text><Text style={styles.workedTotalValue}>2,030 kcal</Text></View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Protein first, preferences second</Text>
      <View style={styles.flow}>{steps.map(([title, copy], index) => <View key={title} style={styles.flowStep}><Text style={styles.flowNum}>{index + 1}</Text><Text style={styles.flowTitle}>{title}</Text><Text style={styles.flowCopy}>{copy}</Text></View>)}</View>
      <Text style={styles.legend}>Alcohol supplies energy, but it is not one of the three tracked food macros on this sheet. Use professional targets if you are pregnant, have a medical condition or eating-disorder history, or follow a clinician-directed plan.</Text>
      <Footer page={2} />
    </Page>
  );
}

function ProteinReferencePage({ foods }: { foods: MacroFood[] }) {
  return (
    <Page size="LETTER" style={styles.page}>
      <PageHeader title="Protein food reference" intro="Values are rounded estimates. Match the listed cooked, drained, fat-percentage, or prepared state when logging." sheet="PRINTABLE SHEET 2" />
      <MacroTable foods={foods} efficiency />
      <Text style={styles.legend}>E = protein-efficient: at least 0.10 g protein per kcal. The marker is a numeric filter, not a judgment about food quality. Brands, cuts, fat percentage, serving size, and added cooking fat can change every value. P = protein, C = carbohydrate, F = fat.</Text>
      <Footer page={3} />
    </Page>
  );
}

function CarbFatReferencePage({ carbFoods: carbs, fatFoods: fats, mixedFoods: mixed }: { carbFoods: MacroFood[]; fatFoods: MacroFood[]; mixedFoods: MacroFood[] }) {
  return (
    <Page size="LETTER" style={styles.page}>
      <PageHeader title="Carb, fat & mixed-food reference" intro="Use the dominant macro to build a meal, then count the complete P / C / F profile when tracking." sheet="PRINTABLE SHEET 3" />
      <View style={styles.compactSections}>
        <View style={[styles.compactCol, styles.compactColLeft]}><Text style={styles.sectionTitle}>Carbohydrate-dominant foods</Text><MacroTable foods={carbs} compact /></View>
        <View style={styles.compactCol}><Text style={styles.sectionTitle}>Fat-dominant foods</Text><MacroTable foods={fats} compact /></View>
      </View>
      <View style={styles.mixedStrip}>
        <Text style={styles.sectionTitle}>Mixed foods: count every macro</Text>
        <View style={styles.mixedGrid}>{mixed.map((food) => <View key={`${food.name}-${food.serving}`} style={styles.mixedItem} wrap={false}><Text style={styles.mixedName}>{food.name} · {food.serving}</Text><Text style={styles.mixedMacros}>{food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g</Text></View>)}</View>
      </View>
      <Text style={styles.legend}>P = protein, C = carbohydrate, F = fat. Values are rounded; recipes, brands, and added oil vary.</Text>
      <Footer page={4} />
    </Page>
  );
}

function MealBuilderPage({ meals }: { meals: MealExample[] }) {
  const steps = [
    ["1 · Protein anchor", "Choose poultry, seafood, dairy, eggs, legumes, tofu, tempeh, or another protein."],
    ["2 · Carbohydrate", "Add a serving that fits activity, appetite, and preference."],
    ["3 · Measured fat", "Measure oils, nuts, seeds, cheese, avocado, or dressing."],
    ["4 · Produce / volume", "Add fruit or vegetables; count their full macros too."],
  ];
  return (
    <Page size="LETTER" style={styles.page}>
      <PageHeader title="Build a repeatable meal" intro="Combine one clear anchor with portions you can reproduce. Examples demonstrate the method; they are not prescriptions." sheet="PRINTABLE SHEET 4" />
      <View style={styles.stepRow}>{steps.map(([title, copy], index) => <View key={title} style={[styles.stepCard, index === steps.length - 1 ? styles.stepCardLast : {}]}><Text style={styles.stepNumber}>STEP {index + 1}</Text><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepCopy}>{copy}</Text></View>)}</View>
      <Text style={styles.sectionTitle}>Three worked meals</Text>
      <View style={styles.mealRow}>{meals.map((meal, index) => <View key={meal.name} style={[styles.mealCard, index === meals.length - 1 ? styles.mealCardLast : {}]} wrap={false}><Text style={styles.mealTitle}>{meal.name}</Text>{meal.items.map((item) => <Text key={item.name} style={styles.mealItem}>• {item.name} — {item.macros.calories} kcal · P {item.macros.protein}g · C {item.macros.carbs}g · F {item.macros.fat}g</Text>)}<MacroTotalsRow totals={meal.total} /></View>)}</View>
      <Text style={styles.sectionTitle}>My repeatable meals</Text>
      <View style={styles.mealPlanRow}>{[1, 2].map((number) => <View key={number} style={[styles.mealPlanBox, number === 2 ? styles.mealPlanBoxLast : {}]}><Text style={styles.mealPlanTitle}>Meal {number}: ______________________________</Text><View style={styles.writeLine} /><View style={styles.writeLine} /><View style={styles.writeLine} /><Text style={styles.legend}>Total: ______ kcal · P _____g · C _____g · F _____g</Text></View>)}</View>
      <Text style={styles.legend}>Smart swaps preserve the meal's purpose: use higher-protein dairy when you need more P, reduce or measure oil when you need less F, or adjust the starch portion when you need a different C amount.</Text>
      <Footer page={5} />
    </Page>
  );
}

function MacroLogPage({ days, appMockup: mockup }: { days: readonly string[]; appMockup: string | null }) {
  const averages = ["Calories", "Protein (P)", "Carbohydrates (C)", "Fat (F)"];
  return (
    <Page size="LETTER" style={styles.page}>
      <PageHeader title="Seven-day macro log" intro="Record each day's totals, then use the weekly averages to see the pattern behind normal daily variation." sheet="PRINTABLE SHEET 5" />
      <View style={styles.logTable}>
        <View style={styles.logHeader}><Text style={[styles.logHeaderText, { width: 58 }]}>Day</Text><Text style={[styles.logHeaderText, { width: 62 }]}>Calories</Text><Text style={[styles.logHeaderText, { width: 62 }]}>P · g</Text><Text style={[styles.logHeaderText, { width: 62 }]}>C · g</Text><Text style={[styles.logHeaderText, { width: 62 }]}>F · g</Text><Text style={[styles.logHeaderText, { flex: 1 }]}>Notes</Text></View>
        {days.map((day) => <View key={day} style={styles.logRow} wrap={false}><Text style={styles.logDay}>{day}</Text><View style={styles.logNumber} /><View style={styles.logNumber} /><View style={styles.logNumber} /><View style={styles.logNumber} /><View style={styles.logNotes} /></View>)}
      </View>
      <Text style={styles.sectionTitle}>Weekly averages</Text>
      <View style={styles.averages}>{averages.map((average, index) => <View key={average} style={[styles.averageField, index === averages.length - 1 ? styles.averageFieldLast : {}]}><Text style={styles.averageLabel}>{average}</Text><View style={styles.averageLine} /></View>)}</View>
      <Text style={styles.consistency}>Consistency note: weekly patterns matter more than hitting every gram exactly. Use the log to learn, adjust portions gradually, and keep targets flexible enough to live with.</Text>
      <View style={styles.cta}>
        <View style={styles.ctaText}><Text style={styles.ctaTitle}>Plan with the sheet. Track with a photo.</Text><Text style={styles.ctaCopy}>CalorieCue turns a meal photo into a quick calorie and macro estimate, reducing the friction of daily logging.</Text><Text style={styles.ctaUrl}>caloriecue.app</Text></View>
        {mockup ? <Image src={mockup} style={styles.ctaImage} /> : null}
      </View>
      <Footer page={6} />
    </Page>
  );
}

export function MacroCheatSheetDocument() {
  return (
    <Document title="Macro Tracking Cheat Sheet" author="CalorieCue" subject="Protein, carbohydrate and fat food reference with macro log">
      <MacroCoverPage logo={logo} />
      <MacroQuickStartPage />
      <ProteinReferencePage foods={proteinFoods} />
      <CarbFatReferencePage carbFoods={carbFoods} fatFoods={fatFoods} mixedFoods={mixedFoods} />
      <MealBuilderPage meals={mealExamples} />
      <MacroLogPage days={logDays} appMockup={appMockup} />
    </Document>
  );
}

let cachedBuffer: Buffer | null = null;
let renderPromise: Promise<Buffer> | null = null;

export async function renderMacroCheatSheetPdf(): Promise<Buffer> {
  if (cachedBuffer) {
    return cachedBuffer;
  }

  if (!renderPromise) {
    renderPromise = renderToBuffer(<MacroCheatSheetDocument />)
      .then((buffer) => {
        cachedBuffer = buffer;
        return buffer;
      })
      .finally(() => {
        renderPromise = null;
      });
  }

  return renderPromise;
}

export const MACRO_CHEAT_SHEET_PDF_FILENAME =
  "caloriecue-macro-tracking-cheat-sheet.pdf";
