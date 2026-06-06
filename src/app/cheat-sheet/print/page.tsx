import type { Metadata } from "next";
import PrintButton from "./PrintButton";
import {
  calorieTargets,
  handMethod,
  portionTraps,
  trackingRules,
} from "@/lib/cheat-sheet/data";

export const metadata: Metadata = {
  title: "Calorie Counting Cheat Sheet — Quick Reference",
  description:
    "A printable quick-reference of calorie targets, portion sizes, and tracking rules. Download the full 5-page Calorie Counting Cheat Sheet PDF for the complete guide.",
  robots: { index: false, follow: false },
};

const PDF_URL = "/api/cheat-sheet/pdf";

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

      {/* Top bar - hidden when printing */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">
          Quick reference below — or get the full 5-page PDF
        </span>
        <div className="flex items-center gap-2">
          <a
            href={PDF_URL}
            className="px-5 py-2 bg-[#E05A3A] text-white text-sm font-semibold rounded-lg hover:bg-[#C74B2E] transition-colors"
          >
            Download full PDF
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Cheat sheet content */}
      <div className="max-w-[800px] mx-auto px-6 pt-20 pb-10 print:pt-0 print:pb-0 print:px-0 print:max-w-none font-[system-ui,-apple-system,sans-serif] text-[#1a1a1a]">
        {/* Header */}
        <div className="text-center mb-4 print:mb-4">
          <h1 className="text-2xl font-bold text-[#E05A3A] print:text-xl">
            Calorie Counting Cheat Sheet
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            caloriecue.app — your quick-reference guide
          </p>
        </div>

        {/* Upgrade banner (screen only) */}
        <div className="no-print mb-5 rounded-xl border border-[#E05A3A]/30 bg-[#FFF5F2] px-4 py-3 text-sm text-[#7a2e1a]">
          This is the quick version. The{" "}
          <a href={PDF_URL} className="font-semibold underline">
            full 5-page PDF
          </a>{" "}
          adds ~90 common foods, high-protein low-calorie foods &amp; smart swaps,
          a restaurant &amp; fast-food guide, and a printable 7-day tracking log.
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
                  {calorieTargets.map((t, i) => (
                    <tr
                      key={t.weight}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-1 px-2 border border-gray-200 font-medium">
                        {t.weight}
                      </td>
                      <td className="py-1 px-2 text-center border border-gray-200">
                        {t.lose}
                      </td>
                      <td className="py-1 px-2 text-center border border-gray-200">
                        {t.maintain}
                      </td>
                      <td className="py-1 px-2 text-center border border-gray-200">
                        {t.gain}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 mt-1">
                Estimates for moderately active adults (Mifflin-St Jeor).
              </p>
            </section>

            {/* Hand Method */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                Portion Sizes (Hand Method)
              </h2>
              <div className="space-y-1.5 text-xs">
                {handMethod.map((h) => (
                  <div key={h.hand} className="flex gap-2 items-baseline">
                    <span className="font-semibold whitespace-nowrap min-w-[80px]">
                      {h.hand}
                    </span>
                    <span>
                      {h.serving} —{" "}
                      <span className="text-gray-500">{h.examples}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-4 print:space-y-3">
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
                  {portionTraps.map((p, i) => (
                    <tr
                      key={p.food}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-0.5 px-2 border border-gray-200 font-medium">
                        {p.food}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center">
                        {p.serving}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-center text-[#E05A3A] font-medium">
                        {p.typical}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 7 Rules */}
            <section>
              <h2 className="text-sm font-bold text-[#E05A3A] mb-1.5 uppercase tracking-wide">
                7 Rules for Easy Tracking
              </h2>
              <ol className="text-xs space-y-1 pl-4 list-decimal">
                {trackingRules.map((rule) => (
                  <li key={rule.title}>
                    <strong>{rule.title}</strong>
                    <span className="text-gray-500"> — {rule.detail}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between print:mt-3 print:pt-2">
          <div className="text-xs text-gray-400">
            <span className="font-semibold text-[#E05A3A]">CalorieCue</span> — AI
            Photo Calorie Tracker
          </div>
          <div className="text-xs text-gray-400">
            Download the app: caloriecue.app
          </div>
        </div>
      </div>
    </>
  );
}
