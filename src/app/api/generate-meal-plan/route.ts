import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { calories, protein, carbs, fat, meals, preference } = await req.json();

    if (!calories || !protein || !carbs || !fat) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const mealLabels = meals || ["Breakfast", "Lunch", "Dinner", "Snacks"];
    const dietPref = preference || "standard";

    const prompt = `You are a nutrition expert. Generate a realistic 1-day meal plan with these exact targets:

- Total calories: ${calories} cal
- Protein: ${protein}g
- Carbs: ${carbs}g
- Fat: ${fat}g
- Meals: ${mealLabels.join(", ")}
- Dietary preference: ${dietPref}

Rules:
- Use common, easy-to-find foods with realistic portion sizes
- Each food item must have calories, protein, carbs, and fat values
- The sum of all items across all meals MUST equal the targets within ±15 calories and ±3g per macro
- Use 2-4 items per meal
- For "Snacks" use 1-2 simple items
- Keep portion sizes realistic (don't use fractional servings like "1.3 cups")
- Food names should be concise (e.g., "Grilled chicken breast" not "Boneless skinless grilled chicken breast fillet")

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "meals": [
    {
      "label": "Breakfast",
      "items": [
        { "name": "Food name", "portion": "1 cup", "calories": 300, "protein": 20, "carbs": 30, "fat": 10 }
      ]
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse meal plan" }, { status: 500 });
    }

    const mealPlan = JSON.parse(jsonMatch[0]);

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}
