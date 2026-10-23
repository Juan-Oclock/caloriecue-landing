import React from "react";
import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { registerFonts } from "../cheat-sheet/assets";
import { mealBases, mealTotals, nutrients, portionFoods, proteinLabel, sourceUrl } from "./data";
registerFonts();
const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Inter", fontSize: 9, color: "#302A26", backgroundColor: "#FFFFFF" },
  brand: { fontSize: 10, fontWeight: 700, color: "#B94329", marginBottom: 9 },
  title: { fontSize: 25, fontWeight: 700, lineHeight: 1.15, marginBottom: 9 },
  intro: { fontSize: 9, lineHeight: 1.5, color: "#625B55", marginBottom: 16 },
  header: { flexDirection: "row", padding: 8, backgroundColor: "#F4E8DD", fontSize: 8, fontWeight: 700 },
  row: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#E8E2DC" },
  food: { width: "45%" }, portion: { width: "25%" }, protein: { width: "16%" }, kcal: { width: "14%" },
  small: { fontSize: 7, color: "#625B55", lineHeight: 1.4, marginTop: 3 },
  section: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  meals: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meal: { width: "49%", backgroundColor: "#F7F6F0", padding: 9, borderRadius: 5 },
  footer: { fontSize: 7, lineHeight: 1.5, color: "#625B55", marginTop: 12 },
});
export function ProteinPortionDocument() {
  return <Document title="What does 30g of protein look like?" author="CalorieCue Team">
    <Page size="A4" style={styles.page}>
      <Text style={styles.brand}>CALORIECUE / SAVE FOR YOUR NEXT MEAL</Text>
      <Text style={styles.title}>What does 30g of protein look like?</Text>
      <Text style={styles.intro}>Eight portions providing about 30g protein. These are food weights, not grams of protein powder or a universal meal target. Use the stated preparation state and check your package label.</Text>
      <View style={styles.header}><Text style={styles.food}>FOOD / PREPARATION</Text><Text style={styles.portion}>FOOD WEIGHT</Text><Text style={styles.protein}>PROTEIN</Text><Text style={styles.kcal}>KCAL</Text></View>
      {portionFoods.map(food => { const n=nutrients(food.id,food.grams); return <View key={food.id} style={styles.row} wrap={false}>
        <View style={styles.food}><Text style={{ fontWeight: 700 }}>{food.name}</Text><Text style={styles.small}>{food.state}</Text></View>
        <View style={styles.portion}><Text>{food.grams} g / {(food.grams/28.349523125).toFixed(1)} oz</Text><Text style={styles.small}>{food.cue}</Text></View>
        <Text style={styles.protein}>{proteinLabel(n.protein)} g</Text><Text style={styles.kcal}>{Math.round(n.calories)}</Text>
      </View>; })}
      <Text style={styles.section}>Build around 30g with two foods</Text>
      <View style={styles.meals}>{mealBases.map(meal => { const n=mealTotals(meal); return <View key={meal.name} style={styles.meal} wrap={false}>
        <Text style={{fontWeight:700}}>{meal.name}</Text><Text style={styles.small}>{meal.description}</Text>
        <Text style={{fontSize:8,marginTop:5,color:"#B94329"}}>{proteinLabel(n.protein)} g protein / {Math.round(n.calories)} kcal</Text>
      </View>; })}</View>
      <Text style={styles.footer}>Meal examples count only the listed foods. Add vegetables, grains and other sides as you like; log their nutrients and any oil or sauce separately. Cups and pack fractions are rough cues; weights determine these calculations. Tofu and yogurt brands can differ substantially.</Text>
      <Text style={styles.footer}>Sources: USDA FoodData Central, SR Legacy April 2018 dataset, checked 23 October 2026. Per-100g values scaled to the shown weights; protein rounded to 0.1 g and calories to whole kcal. Reference averages, not laboratory measurements of your serving.</Text>
      <Text style={{...styles.footer,marginTop:5}}>USDA records: {portionFoods.map((f,i)=><React.Fragment key={f.id}>{i ? " | " : ""}<Link src={sourceUrl(f.fdcId)}>{f.fdcId}</Link></React.Fragment>)}</Text>
      <Link style={{fontSize:8,marginTop:10,color:"#B94329"}} src="https://caloriecue.app/blog/what-does-30g-of-protein-look-like">Full guide, source details and meal logging: caloriecue.app/blog/what-does-30g-of-protein-look-like</Link>
    </Page>
  </Document>;
}
