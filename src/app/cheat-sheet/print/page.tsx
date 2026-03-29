import type { Metadata } from "next";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Calorie Counting Cheat Sheet — Printable",
  description:
    "A printable one-page calorie counting cheat sheet with calorie targets, portion sizes, common food calories, and tracking tips.",
  robots: { index: false, follow: false },
};

export default function CheatSheetPrintPage() {
  return (
    <>
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print button - hidden when printing */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Use <strong>Ctrl/Cmd + P</strong> or the button below to save as PDF
        </span>
        <PrintButton />
      </div>

      {/* Cheat sheet content */}
      <div className="max-w-[800px] mx-auto px-6 pt-20 pb-10 print:pt-0 print:pb-0 print:px-0 print:max-w-none font-[system-ui,-apple-system,sans-serif] text-[#1a1a1a]">
        {/* Header */}
        <div className="text-center mb-5 print:mb-4">
          <h1 className="text-2xl font-bold text-[#E05A3A] print:text-xl">
            Calorie Counting Cheat Sheet
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            caloriecue.app — Your complete quick-reference guide
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 print:gap-3">
          {/* Left column */}
          <div className="space-y-4 print:space-y-3">
            {/* Calorie Targets */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                Calorie Targets (by weight &amp; goal)
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FFF5F2]">
                    <th className="py-1 px-2 text-left border border-gray-200 font-semibold">
                      Weight
                    </th>
                    <th className="py-1 px-2 text-center border border-gray-200 font-semibold">
                      Lose
                    </th>
                    <th className="py-1 px-2 text-center border border-gray-200 font-semibold">
                      Maintain
                    </th>
                    <th className="py-1 px-2 text-center border border-gray-200 font-semibold">
                      Gain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["120 lbs", "1,200–1,400", "1,600–1,800", "1,900–2,100"],
                    ["140 lbs", "1,300–1,500", "1,700–1,900", "2,000–2,200"],
                    ["160 lbs", "1,400–1,600", "1,900–2,100", "2,200–2,400"],
                    ["180 lbs", "1,500–1,800", "2,100–2,300", "2,400–2,600"],
                    ["200 lbs", "1,600–1,900", "2,300–2,500", "2,600–2,800"],
                    ["220+ lbs", "1,800–2,100", "2,500–2,700", "2,800–3,000"],
                  ].map(([weight, lose, maintain, gain], i) => (
                    <tr key={weight} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-1 px-2 border border-gray-200 font-medium">
                        {weight}
                      </td>
                      <td className="py-1 px-2 text-center border border-gray-200">
                        {lose}
                      </td>
                      <td className="py-1 px-2 text-center border border-gray-200">
                        {maintain}
                      </td>
                      <td className="py-1 px-2 text-center border border-gray-200">
                        {gain}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Hand Method */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                Portion Sizes (Hand Method)
              </h2>
              <div className="space-y-1.5 text-xs">
                {[
                  ["✋ Palm", "1 protein serving (~150–200 cal)", "Chicken, fish, tofu"],
                  ["✊ Fist", "1 carb serving (~150–200 cal)", "Rice, pasta, potatoes"],
                  ["👍 Thumb", "1 fat serving (~100–120 cal)", "Oil, butter, nut butter"],
                  ["✊✊ Two fists", "1 veggie serving (~50 cal)", "Salad, broccoli, greens"],
                ].map(([hand, serving, examples]) => (
                  <div key={hand} className="flex gap-2 items-baseline">
                    <span className="font-semibold whitespace-nowrap min-w-[90px]">
                      {hand}
                    </span>
                    <span>
                      {serving} — <span className="text-gray-500">{examples}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7 Rules */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                7 Rules for Easy Tracking
              </h2>
              <ol className="text-xs space-y-1 pl-4 list-decimal">
                <li>
                  <strong>Track as you eat</strong> — not hours later
                </li>
                <li>
                  <strong>Use AI photo tracking</strong> — snap &amp; move on
                </li>
                <li>
                  <strong>Track weekends too</strong> — where most deficits die
                </li>
                <li>
                  <strong>Aim for ±100 cal</strong> — not perfection
                </li>
                <li>
                  <strong>Track beverages</strong> — liquid calories add up
                </li>
                <li>
                  <strong>Meal prep</strong> — same meals = less tracking
                </li>
                <li>
                  <strong>Review weekly averages</strong> — not daily numbers
                </li>
              </ol>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-4 print:space-y-3">
            {/* Proteins */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                Common Foods — Calories
              </h2>

              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                Proteins
              </h3>
              <table className="w-full text-xs border-collapse mb-2">
                <tbody>
                  {[
                    ["Chicken breast (grilled)", "4 oz", "185"],
                    ["Salmon fillet", "4 oz", "230"],
                    ["Eggs", "2 large", "140"],
                    ["Ground beef (90% lean)", "4 oz", "200"],
                    ["Greek yogurt (plain)", "1 cup", "130"],
                  ].map(([food, serving, cal], i) => (
                    <tr key={food} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-0.5 px-2 border border-gray-200">{food}</td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center text-gray-500 whitespace-nowrap">
                        {serving}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center font-medium whitespace-nowrap">
                        {cal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                Carbs
              </h3>
              <table className="w-full text-xs border-collapse mb-2">
                <tbody>
                  {[
                    ["White rice (cooked)", "1 cup", "206"],
                    ["Pasta (cooked)", "1 cup", "220"],
                    ["Whole wheat bread", "1 slice", "80"],
                    ["Sweet potato", "1 medium", "103"],
                    ["Oatmeal (cooked)", "1 cup", "154"],
                  ].map(([food, serving, cal], i) => (
                    <tr key={food} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-0.5 px-2 border border-gray-200">{food}</td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center text-gray-500 whitespace-nowrap">
                        {serving}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center font-medium whitespace-nowrap">
                        {cal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                Fats
              </h3>
              <table className="w-full text-xs border-collapse mb-2">
                <tbody>
                  {[
                    ["Avocado", "½ medium", "120"],
                    ["Olive oil", "1 tbsp", "120"],
                    ["Almonds", "1 oz (23)", "164"],
                    ["Peanut butter", "1 tbsp", "95"],
                  ].map(([food, serving, cal], i) => (
                    <tr key={food} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-0.5 px-2 border border-gray-200">{food}</td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center text-gray-500 whitespace-nowrap">
                        {serving}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center font-medium whitespace-nowrap">
                        {cal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                Drinks &amp; Snacks
              </h3>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {[
                    ["Black coffee", "8 oz", "2"],
                    ["Latte (whole milk)", "12 oz", "180"],
                    ["Orange juice", "8 oz", "110"],
                    ["Banana", "1 medium", "105"],
                    ["Protein bar", "1 bar", "200–250"],
                    ["Trail mix", "¼ cup", "175"],
                  ].map(([food, serving, cal], i) => (
                    <tr key={food} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-0.5 px-2 border border-gray-200">{food}</td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center text-gray-500 whitespace-nowrap">
                        {serving}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center font-medium whitespace-nowrap">
                        {cal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Portions that trip people up */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                Portions That Trip People Up
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FFF5F2]">
                    <th className="py-1 px-2 text-left border border-gray-200 font-semibold">
                      Food
                    </th>
                    <th className="py-1 px-2 text-center border border-gray-200 font-semibold">
                      1 Serving
                    </th>
                    <th className="py-1 px-2 text-center border border-gray-200 font-semibold">
                      Typical
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Cooking oil", "1 tbsp = 120", "3 tbsp = 360"],
                    ["Peanut butter", "1 tbsp = 95", "2–3 tbsp = 190–285"],
                    ["Cooked rice", "1 cup = 206", "2–3 cups = 412–618"],
                    ["Granola", "⅓ cup = 140", "1+ cup = 420+"],
                    ["Salad dressing", "2 tbsp = 140", "4–6 tbsp = 280–420"],
                  ].map(([food, serving, typical], i) => (
                    <tr key={food} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-0.5 px-2 border border-gray-200 font-medium">
                        {food}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center">
                        {serving}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center text-[#E05A3A] font-medium">
                        {typical}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between print:mt-3 print:pt-2">
          <div className="text-xs text-gray-400">
            <span className="font-semibold text-[#E05A3A]">CalorieCue</span>{" "}
            — AI Photo Calorie Tracker
          </div>
          <div className="text-xs text-gray-400">
            Download the app: caloriecue.app
          </div>
        </div>
      </div>
    </>
  );
}
