/**
 * The Complete Calorie Counting Cheat Sheet — a branded, multi-page PDF built
 * with @react-pdf/renderer (server-only; see `serverExternalPackages` and
 * `outputFileTracingIncludes` in next.config.ts). Rendered to a Buffer via
 * `renderToBuffer` in the cheat-sheet API routes.
 *
 * Optional imagery (cover photo, hand-portion strip) is loaded via publicAsset
 * and degrades gracefully when the files aren't present.
 */
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { registerFonts, publicAsset } from "./assets";
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

registerFonts();

// Resolved once per server instance. cover-food / hand-portions are optional
// (added later via nano-banana); the rest already exist in the repo.
const coverImg =
  publicAsset("cheat-sheet/cover-food.jpg") ??
  publicAsset("cheat-sheet/cover-food.png");
const handImg =
  publicAsset("cheat-sheet/hand-portions.png") ??
  publicAsset("cheat-sheet/hand-portions.jpg");
const logoImg =
  publicAsset("app-icons/1024.png") ?? publicAsset("caloriecue_logo.png");
const appMockup = publicAsset("mockup-caloriecue.png");

const C = {
  brand: "#E05A3A",
  brandDark: "#BC4527",
  brandLight: "#FF7F5C",
  tintHead: "#FCF6F3",
  tintCard: "#FFF6F2",
  ink: "#1A1A1A",
  gray: "#6B7280",
  faint: "#9CA3AF",
  hair: "#ECECEC",
  divider: "#F3F3F3",
  rowAlt: "#FAFAFA",
};

// Per-category accent colors (mirror the app's macro palette where it fits).
const CAT_COLORS: Record<string, string> = {
  Proteins: "#E05C7A",
  "Grains & Carbs": "#3B82F6",
  "Fats & Nuts": "#F59E0B",
  "Fruits & Vegetables": "#10B981",
  Drinks: "#06B6D4",
  "Snacks & Treats": "#8B5CF6",
  "Condiments & Sauces": "#EF4444",
};

const s = StyleSheet.create({
  // ---- base ----
  page: {
    paddingTop: 30,
    paddingHorizontal: 34,
    paddingBottom: 42,
    fontFamily: "Inter",
    fontSize: 9,
    color: C.ink,
  },
  // ---- cover ----
  coverPage: { fontFamily: "Inter", color: C.ink },
  coverHero: { width: "100%", height: 290, objectFit: "cover" },
  coverHeroFallback: {
    width: "100%",
    height: 290,
    backgroundColor: C.tintCard,
    alignItems: "center",
    justifyContent: "center",
  },
  coverHeroLogo: { width: 84, height: 84, borderRadius: 18, marginBottom: 12 },
  coverHeroFallbackBrand: { fontSize: 20, fontWeight: 700, color: C.brand },
  coverHeroFallbackTag: { fontSize: 10, color: C.gray, marginTop: 4 },
  coverBody: { paddingHorizontal: 44, paddingTop: 26 },
  coverBrandRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  coverLogo: { width: 22, height: 22, borderRadius: 6, marginRight: 8 },
  coverBrand: { fontSize: 13, fontWeight: 700, color: C.ink, letterSpacing: 0.2 },
  coverKicker: {
    fontSize: 9,
    fontWeight: 700,
    color: C.brand,
    letterSpacing: 2,
    marginBottom: 8,
  },
  coverTitle: { fontSize: 31, fontWeight: 700, color: C.ink, lineHeight: 1.12 },
  coverSubtitle: {
    fontSize: 11,
    color: C.gray,
    lineHeight: 1.5,
    marginTop: 14,
    maxWidth: 430,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 20 },
  pill: {
    fontSize: 8.5,
    fontWeight: 600,
    color: C.brandDark,
    backgroundColor: C.tintCard,
    borderWidth: 0.8,
    borderColor: "#F4D9CE",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 11,
    marginRight: 7,
    marginBottom: 7,
  },
  coverFooter: {
    position: "absolute",
    bottom: 34,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 0.8,
    borderColor: C.hair,
  },
  coverFooterText: { fontSize: 9, color: C.faint, fontWeight: 500 },
  // ---- page header / masthead ----
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brandLeft: { flexDirection: "row", alignItems: "center" },
  brandLogo: { width: 15, height: 15, borderRadius: 4, marginRight: 6 },
  brandName: { fontSize: 10, fontWeight: 700, color: C.ink },
  kicker: { fontSize: 7, fontWeight: 600, color: C.faint, letterSpacing: 1.2 },
  pageTitle: { fontSize: 17, fontWeight: 700, color: C.brand },
  pageIntro: { fontSize: 9, color: C.gray, lineHeight: 1.45, marginTop: 3 },
  headerRule: { marginTop: 9, marginBottom: 12, height: 2, backgroundColor: C.brand },
  // ---- section ----
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: C.brandDark,
    letterSpacing: 0.4,
    marginTop: 13,
    marginBottom: 6,
  },
  note: { fontSize: 7.5, color: C.faint, marginTop: 5, lineHeight: 1.4 },
  // ---- modern table ----
  table: {
    borderWidth: 0.8,
    borderColor: C.hair,
    borderRadius: 6,
    overflow: "hidden",
  },
  tHead: { flexDirection: "row", backgroundColor: C.tintHead },
  tHeadCell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  tRow: { flexDirection: "row", borderTopWidth: 0.6, borderColor: C.divider },
  tRowAlt: { backgroundColor: C.rowAlt },
  tCell: { paddingVertical: 1.9, paddingHorizontal: 6, fontSize: 8.2, color: C.ink },
  cellStrong: { fontWeight: 600 },
  // ---- hand method ----
  handStrip: { width: "100%", height: 116, objectFit: "cover", borderRadius: 6, marginTop: 3 },
  handLabels: { flexDirection: "row", marginTop: 2 },
  handLabel: { flex: 1, alignItems: "center", paddingHorizontal: 3 },
  handName: { fontSize: 8.5, fontWeight: 700, color: C.ink },
  handDesc: { fontSize: 6.8, color: C.gray, textAlign: "center", marginTop: 1, lineHeight: 1.3 },
  handRow: { flexDirection: "row", marginBottom: 3, alignItems: "baseline" },
  handRowName: { width: 70, fontSize: 8.5, fontWeight: 700, color: C.ink },
  handRowBody: { flex: 1, fontSize: 8.5, color: C.ink },
  handRowEx: { color: C.gray },
  // ---- rules ----
  ruleRow: { flexDirection: "row", marginBottom: 4 },
  ruleNum: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.tintCard,
    color: C.brand,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 3.5,
    marginRight: 7,
  },
  ruleBody: { flex: 1 },
  ruleTitle: { fontSize: 8.6, fontWeight: 600, color: C.ink },
  ruleDetail: { fontSize: 8, color: C.gray, lineHeight: 1.35 },
  // ---- two column ----
  twoCol: { flexDirection: "row" },
  colLeft: { flex: 1, marginRight: 11 },
  colRight: { flex: 1 },
  // ---- category block ----
  catBlock: { marginBottom: 1 },
  catHeader: { flexDirection: "row", alignItems: "center", marginTop: 5, marginBottom: 3 },
  catDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  catTitle: { fontSize: 9, fontWeight: 700, color: C.ink },
  // ---- tips ----
  tipsCard: {
    backgroundColor: C.tintCard,
    borderRadius: 6,
    padding: 11,
    marginTop: 14,
  },
  tipRow: { flexDirection: "row", marginBottom: 4 },
  tipDot: { width: 11, fontSize: 9, color: C.brand, fontWeight: 700 },
  tipText: { flex: 1, fontSize: 8.5, color: C.ink, lineHeight: 1.35 },
  // ---- 7-day log ----
  logHeadRow: { flexDirection: "row", backgroundColor: C.brand, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  logHeadCell: {
    paddingVertical: 5,
    paddingHorizontal: 3,
    fontSize: 7.5,
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center",
  },
  logRow: { flexDirection: "row", borderBottomWidth: 0.6, borderColor: C.hair },
  logDayCell: {
    width: 34,
    minHeight: 52,
    paddingVertical: 5,
    paddingHorizontal: 3,
    fontSize: 8,
    fontWeight: 700,
    color: C.brand,
    backgroundColor: C.tintCard,
    borderRightWidth: 0.6,
    borderColor: C.hair,
  },
  logCell: { flex: 1, minHeight: 52, borderRightWidth: 0.6, borderColor: C.divider },
  logNarrow: { width: 46, minHeight: 52, borderRightWidth: 0.6, borderColor: C.divider },
  logSideBorder: { borderLeftWidth: 0.8, borderColor: C.hair },
  logWrap: { borderWidth: 0.8, borderColor: C.hair, borderRadius: 6, overflow: "hidden" },
  // ---- bottom row (habit + avg) ----
  bottomRow: { flexDirection: "row", marginTop: 13 },
  habitBox: { flex: 1, marginRight: 11 },
  habitItem: { flexDirection: "row", marginBottom: 4, alignItems: "center" },
  checkbox: { width: 9, height: 9, borderWidth: 0.9, borderColor: C.gray, borderRadius: 2, marginRight: 7 },
  habitText: { fontSize: 8.6, color: C.ink },
  avgBox: { flex: 1, borderWidth: 0.9, borderColor: C.brand, borderRadius: 7, padding: 11, backgroundColor: C.tintCard },
  avgLabel: { fontSize: 8.6, fontWeight: 700, color: C.brandDark },
  avgLine: { marginTop: 8, borderBottomWidth: 0.8, borderColor: C.faint, height: 15 },
  // ---- app CTA ----
  ctaCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.tintCard,
    borderWidth: 0.9,
    borderColor: "#F4D9CE",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  ctaTextCol: { flex: 1, paddingRight: 10 },
  ctaTitle: { fontSize: 10.5, fontWeight: 700, color: C.brandDark },
  ctaText: { fontSize: 8.6, color: C.gray, marginTop: 2, lineHeight: 1.4 },
  ctaMockup: { width: 44, height: 88, objectFit: "contain" },
  // ---- footer ----
  footer: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
    borderTopWidth: 0.6,
    borderColor: C.hair,
  },
  footerText: { fontSize: 7.5, color: C.faint, fontWeight: 500 },
});

type Align = "left" | "center" | "right";
interface Column {
  header: string;
  flex?: number;
  width?: number;
  align?: Align;
}

const cellSize = (col: Column) =>
  col.width != null ? { width: col.width } : { flex: col.flex ?? 1 };

function Table({
  columns,
  rows,
  accentColor = C.brandDark,
  accentLastCol = false,
  showHeader = true,
}: {
  columns: Column[];
  rows: string[][];
  accentColor?: string;
  accentLastCol?: boolean;
  showHeader?: boolean;
}) {
  return (
    <View style={s.table}>
      {showHeader ? (
        <View style={s.tHead}>
          {columns.map((col, i) => (
            <Text
              key={i}
              style={[s.tHeadCell, { color: accentColor }, cellSize(col), { textAlign: col.align ?? "left" }]}
            >
              {col.header}
            </Text>
          ))}
        </View>
      ) : null}
      {rows.map((row, r) => (
        <View
          key={r}
          style={[
            s.tRow,
            !showHeader && r === 0 ? { borderTopWidth: 0 } : {},
            r % 2 === 1 ? s.tRowAlt : {},
          ]}
          wrap={false}
        >
          {row.map((cell, c) => (
            <Text
              key={c}
              style={[
                s.tCell,
                cellSize(columns[c]),
                { textAlign: columns[c].align ?? "left" },
                accentLastCol && c === columns.length - 1
                  ? { color: accentColor, fontWeight: 600 }
                  : {},
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
  const color = CAT_COLORS[category.title] ?? C.brand;
  return (
    <View wrap={false} style={s.catBlock}>
      <View style={s.catHeader}>
        <View style={[s.catDot, { backgroundColor: color }]} />
        <Text style={s.catTitle}>{category.title}</Text>
      </View>
      <Table
        columns={[
          { header: "Food", flex: 2.4 },
          { header: "Serving", flex: 1.3 },
          { header: "Cal", flex: 0.9, align: "right" },
        ]}
        rows={category.items.map((f) => [f.name, f.serving, f.calories])}
        accentColor={color}
        showHeader={false}
      />
    </View>
  );
}

function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <>
      <View style={s.brandRow}>
        <View style={s.brandLeft}>
          {logoImg ? <Image src={logoImg} style={s.brandLogo} /> : null}
          <Text style={s.brandName}>CalorieCue</Text>
        </View>
        <Text style={s.kicker}>CALORIE COUNTING CHEAT SHEET</Text>
      </View>
      <Text style={s.pageTitle}>{title}</Text>
      {intro ? <Text style={s.pageIntro}>{intro}</Text> : null}
      <View style={s.headerRule} />
    </>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>CalorieCue · AI Photo Calorie Tracker</Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `caloriecue.app   ·   Page ${pageNumber - 1} of ${totalPages - 1}`
        }
      />
    </View>
  );
}

export function CheatSheetDocument() {
  const leftCats = commonFoods.filter((c) =>
    ["Proteins", "Grains & Carbs", "Fruits & Vegetables"].includes(c.title)
  );
  const rightCats = commonFoods.filter((c) =>
    ["Fats & Nuts", "Drinks", "Snacks & Treats", "Condiments & Sauces"].includes(c.title)
  );

  return (
    <Document
      title="The Complete Calorie Counting Cheat Sheet"
      author="CalorieCue"
      subject="Calorie counting quick-reference guide"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Cover                                                            */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.coverPage}>
        {coverImg ? (
          <Image src={coverImg} style={s.coverHero} />
        ) : (
          <View style={s.coverHeroFallback}>
            {logoImg ? <Image src={logoImg} style={s.coverHeroLogo} /> : null}
            <Text style={s.coverHeroFallbackBrand}>CalorieCue</Text>
            <Text style={s.coverHeroFallbackTag}>AI Photo Calorie Tracker</Text>
          </View>
        )}

        <View style={s.coverBody}>
          <View style={s.coverBrandRow}>
            {logoImg ? <Image src={logoImg} style={s.coverLogo} /> : null}
            <Text style={s.coverBrand}>CalorieCue</Text>
          </View>
          <Text style={s.coverKicker}>FREE GUIDE</Text>
          <Text style={s.coverTitle}>
            The Complete{"\n"}Calorie Counting{"\n"}Cheat Sheet
          </Text>
          <Text style={s.coverSubtitle}>
            Everything you need to start tracking — your calorie targets, portion
            sizes, 80+ food calories, high-protein swaps, a restaurant guide, and
            a printable 7-day log.
          </Text>
          <View style={s.pillRow}>
            {[
              "Calorie targets",
              "Portion sizes",
              "80+ foods",
              "Protein swaps",
              "Restaurant guide",
              "7-day log",
            ].map((p) => (
              <Text key={p} style={s.pill}>
                {p}
              </Text>
            ))}
          </View>
        </View>

        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>caloriecue.app</Text>
          <Text style={s.coverFooterText}>Free printable guide</Text>
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Page 1 — Quick Start                                             */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <PageHeader title="Quick Start" intro="Find your number, master portions, and lock in the habits that make tracking stick." />

        <Text style={s.sectionTitle}>Find Your Calorie Target (by weight & goal)</Text>
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
        {handImg ? (
          <View>
            <Image src={handImg} style={s.handStrip} />
            <View style={s.handLabels}>
              {handMethod.map((h) => (
                <View key={h.hand} style={s.handLabel}>
                  <Text style={s.handName}>{h.hand}</Text>
                  <Text style={s.handDesc}>{h.serving}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          handMethod.map((h) => (
            <View key={h.hand} style={s.handRow}>
              <Text style={s.handRowName}>{h.hand}</Text>
              <Text style={s.handRowBody}>
                {h.serving} — <Text style={s.handRowEx}>{h.examples}</Text>
              </Text>
            </View>
          ))
        )}

        <Text style={s.sectionTitle}>7 Rules That Make Tracking Easy</Text>
        {trackingRules.map((rule, i) => (
          <View key={rule.title} style={s.ruleRow} wrap={false}>
            <Text style={s.ruleNum}>{i + 1}</Text>
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
      {/* Page 2 — Common Foods                                            */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <PageHeader
          title="Common Foods — Calorie Reference"
          intro="80+ everyday foods with calories per serving. Quick estimates within 10–15% are plenty accurate."
        />
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
      {/* Page 3 — High-Protein & Swaps                                    */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <PageHeader
          title="High-Protein Foods & Smart Swaps"
          intro="Protein keeps you full and protects muscle while you lose fat. Here's the most protein for the fewest calories — plus easy swaps that cut calories without cutting satisfaction."
        />
        <Text style={s.sectionTitle}>High-Protein, Low-Calorie Foods</Text>
        <Table
          columns={[
            { header: "Food", flex: 2.2 },
            { header: "Serving", flex: 1.2 },
            { header: "Protein", flex: 1, align: "center" },
            { header: "Calories", flex: 1, align: "center" },
          ]}
          rows={highProteinFoods.map((f) => [f.name, f.serving, f.protein, f.calories])}
          accentColor={CAT_COLORS["Proteins"]}
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
      {/* Page 4 — Restaurant Guide                                        */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <PageHeader
          title="Restaurant & Fast-Food Guide"
          intro="Eating out is the hardest place to track. These ranges keep you in the ballpark — lean to the higher end when unsure."
        />
        <View style={s.twoCol}>
          <View style={s.colLeft}>
            {restaurantItems
              .filter((c) => c.title === "Fast Food")
              .map((cat) => (
                <View key={cat.title}>
                  <Text style={s.sectionTitle}>{cat.title}</Text>
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
                  <Text style={s.sectionTitle}>{cat.title}</Text>
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

        <View style={s.tipsCard}>
          <Text style={[s.sectionTitle, { marginTop: 0 }]}>
            6 Ways to Cut Calories When Eating Out
          </Text>
          {restaurantTips.map((tip) => (
            <View key={tip} style={s.tipRow} wrap={false}>
              <Text style={s.tipDot}>•</Text>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Page 5 — 7-Day Tracking Log                                      */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={s.page}>
        <PageHeader
          title="Your 7-Day Tracking Log"
          intro="Print this page and fill it in by hand for a week. Jot down each meal, total the day, and compare it to your target."
        />

        <View style={s.logWrap}>
          <View style={s.logHeadRow}>
            {logColumns.map((col, i) => (
              <Text
                key={col}
                style={[
                  s.logHeadCell,
                  i === 0 ? { width: 34 } : i >= 5 ? { width: 46 } : { flex: 1 },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
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
        </View>

        <View style={s.bottomRow}>
          <View style={s.habitBox}>
            <Text style={[s.sectionTitle, { marginTop: 0 }]}>Daily Habit Check</Text>
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
            <Text style={[s.note, { marginTop: 4 }]}>
              Target: ___________   ·   Avg: ___________
            </Text>
          </View>
        </View>

        <View style={s.ctaCard} wrap={false}>
          <View style={s.ctaTextCol}>
            <Text style={s.ctaTitle}>Tired of adding this up by hand?</Text>
            <Text style={s.ctaText}>
              CalorieCue logs a full meal in 3 seconds — snap a photo, get instant
              calories and macros. Download free at caloriecue.app.
            </Text>
          </View>
          {appMockup ? <Image src={appMockup} style={s.ctaMockup} /> : null}
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
