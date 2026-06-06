/**
 * The Complete Calorie Counting Cheat Sheet — generated as a real, multi-page
 * PDF with @react-pdf/renderer (server-side only; see `serverExternalPackages`
 * in next.config.ts). Rendered to a Buffer via `renderToBuffer` in the
 * cheat-sheet API routes, then attached to the lead-magnet email and offered
 * as a direct download.
 */
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  calorieTargets,
  handMethod,
  trackingRules,
  portionTraps,
  commonFoods,
  highProteinFoods,
  smartSwaps,
  restaurantItems,
  restaurantTips,
  logWeekdays,
  logColumns,
  habitChecklist,
  type FoodCategory,
} from "./data";

const C = {
  brand: "#E05A3A",
  brandInk: "#7a2e1a",
  brandLight: "#FFF5F2",
  ink: "#1a1a1a",
  gray: "#6b7280",
  faint: "#9ca3af",
  border: "#e5e7eb",
  rowAlt: "#f9fafb",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 34,
    paddingBottom: 46,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.ink,
  },
  // Page header
  docTitle: { fontSize: 19, fontFamily: "Helvetica-Bold", color: C.brand },
  docSubtitle: { fontSize: 9.5, color: C.gray, marginTop: 3 },
  pageTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.brand },
  pageIntro: { fontSize: 9, color: C.gray, marginTop: 3, lineHeight: 1.4 },
  headerRule: {
    marginTop: 8,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderColor: C.brand,
  },
  // Sections
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
    marginTop: 12,
  },
  note: { fontSize: 7.5, color: C.faint, marginTop: 4, lineHeight: 1.4 },
  // Generic table
  table: {
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 3,
  },
  tHeadRow: {
    flexDirection: "row",
    backgroundColor: C.brandLight,
    borderBottomWidth: 0.5,
    borderColor: C.border,
  },
  tHeadCell: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.brandInk,
  },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: C.border },
  tRowAlt: { backgroundColor: C.rowAlt },
  tCell: { paddingVertical: 1.8, paddingHorizontal: 5, fontSize: 8, color: C.ink },
  accent: { color: C.brand, fontFamily: "Helvetica-Bold" },
  // Hand method
  handRow: { flexDirection: "row", marginBottom: 3, alignItems: "baseline" },
  handName: {
    width: 64,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  handBody: { flex: 1, fontSize: 8.5, color: C.ink },
  handExamples: { color: C.gray },
  // Rules
  ruleRow: { flexDirection: "row", marginBottom: 4 },
  ruleNum: {
    width: 15,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
  },
  ruleBody: { flex: 1 },
  ruleTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.ink },
  ruleDetail: { fontSize: 8, color: C.gray, lineHeight: 1.35 },
  // Two-column layout
  twoCol: { flexDirection: "row" },
  colLeft: { flex: 1, marginRight: 10 },
  colRight: { flex: 1 },
  catTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    marginTop: 6,
    marginBottom: 2,
  },
  // Tips
  tipRow: { flexDirection: "row", marginBottom: 3.5 },
  tipDot: { width: 10, fontSize: 9, color: C.brand },
  tipText: { flex: 1, fontSize: 8.5, color: C.ink, lineHeight: 1.35 },
  // Log grid
  logHeadRow: {
    flexDirection: "row",
    backgroundColor: C.brand,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  logHeadCell: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
    borderRightWidth: 0.5,
    borderColor: "#ffffff",
  },
  logRow: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: C.border },
  logDayCell: {
    width: 34,
    minHeight: 64,
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    backgroundColor: C.brandLight,
    borderRightWidth: 0.5,
    borderColor: C.border,
  },
  logCell: {
    flex: 1,
    minHeight: 64,
    borderRightWidth: 0.5,
    borderColor: C.border,
  },
  logNarrow: {
    width: 46,
    minHeight: 64,
    borderRightWidth: 0.5,
    borderColor: C.border,
  },
  // Habit + average row
  bottomRow: { flexDirection: "row", marginTop: 12 },
  habitBox: { flex: 1, marginRight: 10 },
  habitItem: { flexDirection: "row", marginBottom: 3, alignItems: "center" },
  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 0.8,
    borderColor: C.gray,
    borderRadius: 2,
    marginRight: 6,
  },
  habitText: { fontSize: 8.5, color: C.ink },
  avgBox: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: C.brand,
    borderRadius: 4,
    padding: 10,
    backgroundColor: C.brandLight,
  },
  avgLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.brandInk },
  avgLine: {
    marginTop: 8,
    borderBottomWidth: 0.8,
    borderColor: C.faint,
    height: 16,
  },
  // App CTA band
  ctaBand: {
    marginTop: 14,
    borderRadius: 5,
    backgroundColor: C.brandLight,
    borderWidth: 0.8,
    borderColor: C.brand,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  ctaTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: C.brandInk },
  ctaText: { fontSize: 8.5, color: C.gray, marginTop: 2 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 22,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderColor: C.border,
  },
  footerBrand: { fontSize: 7.5, color: C.faint },
  footerMeta: { fontSize: 7.5, color: C.faint },
});

type Align = "left" | "center" | "right";
interface Column {
  header: string;
  flex?: number;
  width?: number;
  align?: Align;
}

function Table({
  columns,
  rows,
  accentLastCol = false,
}: {
  columns: Column[];
  rows: string[][];
  accentLastCol?: boolean;
}) {
  const cellFlex = (col: Column) =>
    col.width != null ? { width: col.width } : { flex: col.flex ?? 1 };
  return (
    <View style={s.table}>
      <View style={s.tHeadRow}>
        {columns.map((col, i) => (
          <Text
            key={i}
            style={[s.tHeadCell, cellFlex(col), { textAlign: col.align ?? "left" }]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={[s.tRow, r % 2 === 1 ? s.tRowAlt : {}]} wrap={false}>
          {row.map((cell, c) => (
            <Text
              key={c}
              style={[
                s.tCell,
                cellFlex(columns[c]),
                { textAlign: columns[c].align ?? "left" },
                accentLastCol && c === columns.length - 1 ? s.accent : {},
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function FoodCategoryBlock({ category }: { category: FoodCategory }) {
  return (
    <View wrap={false}>
      <Text style={s.catTitle}>{category.title}</Text>
      <Table
        columns={[
          { header: "Food", flex: 2.4 },
          { header: "Serving", flex: 1.3 },
          { header: "Cal", flex: 0.9, align: "right" },
        ]}
        rows={category.items.map((f) => [f.name, f.serving, f.calories])}
      />
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerBrand}>CalorieCue — AI Photo Calorie Tracker</Text>
      <Text
        style={s.footerMeta}
        render={({ pageNumber, totalPages }) =>
          `caloriecue.app   ·   Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

export function CheatSheetDocument() {
  // Balance the food reference across two columns.
  const leftCats = commonFoods.filter((c) =>
    ["Proteins", "Grains & Carbs", "Fruits & Vegetables"].includes(c.title)
  );
  const rightCats = commonFoods.filter((c) =>
    ["Fats & Nuts", "Drinks", "Snacks & Treats", "Condiments & Sauces"].includes(
      c.title
    )
  );

  return (
    <Document
      title="The Complete Calorie Counting Cheat Sheet"
      author="CalorieCue"
      subject="Calorie counting quick-reference guide"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Page 1 — Quick Start                                             */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.docTitle}>The Complete Calorie Counting Cheat Sheet</Text>
        <Text style={s.docSubtitle}>
          Everything you need to track calories, in one place — from CalorieCue.
        </Text>
        <View style={s.headerRule} />

        <Text style={s.sectionTitle}>Find Your Calorie Target (by weight &amp; goal)</Text>
        <Table
          columns={[
            { header: "Weight", flex: 1 },
            { header: "Lose", flex: 1.3, align: "center" },
            { header: "Maintain", flex: 1.3, align: "center" },
            { header: "Gain", flex: 1.3, align: "center" },
          ]}
          rows={calorieTargets.map((t) => [t.weight, t.lose, t.maintain, t.gain])}
        />
        <Text style={s.note}>
          Estimates for moderately active adults (Mifflin-St Jeor). For your exact
          number, use the free TDEE calculator at caloriecue.app/tdee-calculator.
        </Text>

        <Text style={s.sectionTitle}>Portion Sizes — The Hand Method</Text>
        {handMethod.map((h) => (
          <View key={h.hand} style={s.handRow}>
            <Text style={s.handName}>{h.hand}</Text>
            <Text style={s.handBody}>
              {h.serving} — <Text style={s.handExamples}>{h.examples}</Text>
            </Text>
          </View>
        ))}

        <Text style={s.sectionTitle}>7 Rules That Make Tracking Easy</Text>
        {trackingRules.map((rule, i) => (
          <View key={rule.title} style={s.ruleRow} wrap={false}>
            <Text style={s.ruleNum}>{i + 1}.</Text>
            <View style={s.ruleBody}>
              <Text style={s.ruleTitle}>{rule.title}</Text>
              <Text style={s.ruleDetail}>{rule.detail}</Text>
            </View>
          </View>
        ))}

        <Text style={s.sectionTitle}>Portions That Trip People Up</Text>
        <Table
          columns={[
            { header: "Food", flex: 1.4 },
            { header: "1 Serving", flex: 1.3, align: "center" },
            { header: "What people actually use", flex: 1.6, align: "center" },
          ]}
          rows={portionTraps.map((p) => [p.food, p.serving, p.typical])}
          accentLastCol
        />

        <Footer />
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Page 2 — Common Foods Calorie Reference                          */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.pageTitle}>Common Foods — Calorie Reference</Text>
        <Text style={s.pageIntro}>
          80+ everyday foods with calories per serving — quick estimates within
          10–15% are plenty accurate.
        </Text>
        <View style={s.headerRule} />

        <View style={s.twoCol}>
          <View style={s.colLeft}>
            {leftCats.map((cat) => (
              <FoodCategoryBlock key={cat.title} category={cat} />
            ))}
          </View>
          <View style={s.colRight}>
            {rightCats.map((cat) => (
              <FoodCategoryBlock key={cat.title} category={cat} />
            ))}
          </View>
        </View>

        <Footer />
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Page 3 — High-Protein Foods & Smart Swaps                        */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.pageTitle}>High-Protein Foods &amp; Smart Swaps</Text>
        <Text style={s.pageIntro}>
          Protein keeps you full and protects muscle while you lose fat. These
          foods give you the most protein for the fewest calories — plus easy
          swaps that cut calories without cutting satisfaction.
        </Text>
        <View style={s.headerRule} />

        <Text style={s.sectionTitle}>High-Protein, Low-Calorie Foods</Text>
        <Table
          columns={[
            { header: "Food", flex: 2.2 },
            { header: "Serving", flex: 1.2 },
            { header: "Protein", flex: 1, align: "center" },
            { header: "Calories", flex: 1, align: "center" },
          ]}
          rows={highProteinFoods.map((f) => [
            f.name,
            f.serving,
            f.protein,
            f.calories,
          ])}
          accentLastCol
        />

        <Text style={s.sectionTitle}>Smart Calorie-Saving Swaps</Text>
        <Table
          columns={[
            { header: "Instead of", flex: 1.6 },
            { header: "Try", flex: 1.8 },
            { header: "You save", flex: 1.1, align: "right" },
          ]}
          rows={smartSwaps.map((sw) => [sw.instead, sw.swap, sw.saves])}
          accentLastCol
        />

        <Footer />
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Page 4 — Restaurant & Fast-Food Guide                            */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.pageTitle}>Restaurant &amp; Fast-Food Guide</Text>
        <Text style={s.pageIntro}>
          Eating out is the hardest place to track. These ranges keep you in the
          ballpark — portions and prep vary, so lean to the higher end when unsure.
        </Text>
        <View style={s.headerRule} />

        <View style={s.twoCol}>
          <View style={s.colLeft}>
            {restaurantItems
              .filter((c) => c.title === "Fast Food")
              .map((cat) => (
                <View key={cat.title}>
                  <Text style={s.catTitle}>{cat.title}</Text>
                  <Table
                    columns={[
                      { header: "Item", flex: 2.2 },
                      { header: "Calories", flex: 1, align: "right" },
                    ]}
                    rows={cat.items.map((it) => [it.name, it.calories])}
                    accentLastCol
                  />
                </View>
              ))}
          </View>
          <View style={s.colRight}>
            {restaurantItems
              .filter((c) => c.title !== "Fast Food")
              .map((cat) => (
                <View key={cat.title}>
                  <Text style={s.catTitle}>{cat.title}</Text>
                  <Table
                    columns={[
                      { header: "Item", flex: 2.2 },
                      { header: "Calories", flex: 1, align: "right" },
                    ]}
                    rows={cat.items.map((it) => [it.name, it.calories])}
                    accentLastCol
                  />
                </View>
              ))}
          </View>
        </View>

        <Text style={s.sectionTitle}>6 Ways to Cut Calories When Eating Out</Text>
        {restaurantTips.map((tip) => (
          <View key={tip} style={s.tipRow} wrap={false}>
            <Text style={s.tipDot}>•</Text>
            <Text style={s.tipText}>{tip}</Text>
          </View>
        ))}

        <Footer />
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Page 5 — 7-Day Tracking Log                                      */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.pageTitle}>Your 7-Day Tracking Log</Text>
        <Text style={s.pageIntro}>
          Print this page and fill it in by hand for a week. Jot down what you eat
          at each meal, add up the day, and compare it to your target.
        </Text>
        <View style={s.headerRule} />

        {/* Log header */}
        <View style={s.logHeadRow}>
          {logColumns.map((col, i) => (
            <Text
              key={col}
              style={[
                s.logHeadCell,
                i === 0
                  ? { width: 34 }
                  : i >= 5
                    ? { width: 46 }
                    : { flex: 1 },
              ]}
            >
              {col}
            </Text>
          ))}
        </View>
        {/* Log rows */}
        {logWeekdays.map((day) => (
          <View key={day} style={s.logRow} wrap={false}>
            <Text style={s.logDayCell}>{day}</Text>
            <View style={s.logCell} />
            <View style={s.logCell} />
            <View style={s.logCell} />
            <View style={s.logCell} />
            <View style={s.logNarrow} />
            <View style={[s.logNarrow, { borderRightWidth: 0 }]} />
          </View>
        ))}

        <View style={s.bottomRow}>
          <View style={s.habitBox}>
            <Text style={s.sectionTitle}>Daily Habit Check</Text>
            {habitChecklist.map((h) => (
              <View key={h} style={s.habitItem}>
                <View style={s.checkbox} />
                <Text style={s.habitText}>{h}</Text>
              </View>
            ))}
          </View>
          <View style={s.avgBox}>
            <Text style={s.avgLabel}>Weekly Average</Text>
            <Text style={s.note}>
              Add your 7 daily totals, divide by 7. This number matters far more
              than any single day.
            </Text>
            <View style={s.avgLine} />
            <Text style={[s.note, { marginTop: 3 }]}>Target: ___________  ·  Avg: ___________</Text>
          </View>
        </View>

        <View style={s.ctaBand}>
          <Text style={s.ctaTitle}>Tired of adding this up by hand?</Text>
          <Text style={s.ctaText}>
            CalorieCue logs a full meal in 3 seconds — snap a photo, get instant
            calories and macros. Download free at caloriecue.app.
          </Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

export default CheatSheetDocument;

/**
 * Render the cheat sheet to a PDF Buffer. The content is static, so we memoize
 * the buffer per warm server instance — the document is only generated once per
 * cold start and reused across every download / email send.
 */
let cachedBuffer: Buffer | null = null;

export async function renderCheatSheetPdf(): Promise<Buffer> {
  if (!cachedBuffer) {
    cachedBuffer = await renderToBuffer(<CheatSheetDocument />);
  }
  return cachedBuffer;
}

export const CHEAT_SHEET_PDF_FILENAME = "caloriecue-cheat-sheet.pdf";
