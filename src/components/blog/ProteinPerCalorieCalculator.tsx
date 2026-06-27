"use client";

import { useState } from "react";

/**
 * Self-contained protein-per-calorie calculator embedded in the
 * /blog/protein-per-calorie post. Ported 1:1 from the standalone
 * vanilla-JS widget in the content drop — food data, tier thresholds,
 * math, and markup are unchanged. The only edits to the source are:
 *   - placeholder orange (#FF6A3D / #FFE7DD family) → CalorieCue brand hex
 *   - Inter → the site's system font stack
 *   - styles scoped under `.ppc` (the source's `:root` vars + bare `*`
 *     selector moved onto `.ppc` so nothing leaks into the page).
 */

type Food = { name: string; p: number; c: number };

const FOODS: Food[] = [
  { name: "Shrimp", p: 24, c: 99 },
  { name: "Egg whites", p: 11, c: 52 },
  { name: "Tuna (in water)", p: 26, c: 116 },
  { name: "Chicken breast", p: 31, c: 165 },
  { name: "Turkey breast", p: 30, c: 135 },
  { name: "Whey protein", p: 25, c: 120 },
  { name: "Greek yogurt (nonfat)", p: 10, c: 59 },
  { name: "Cottage cheese", p: 11, c: 84 },
  { name: "Tofu (firm)", p: 13, c: 110 },
  { name: "Salmon", p: 22, c: 200 },
  { name: "Eggs (whole)", p: 13, c: 155 },
  { name: "Black beans", p: 9, c: 132 },
  { name: "Peanut butter", p: 25, c: 588 },
  { name: "White rice", p: 2.7, c: 130 },
  { name: "Avocado", p: 2, c: 160 },
];

const PICKS = [
  { label: "Chicken breast", p: 31, c: 165 },
  { label: "Eggs", p: 13, c: 155 },
  { label: "Greek yogurt", p: 10, c: 59 },
  { label: "Peanut butter", p: 25, c: 588 },
  { label: "White rice", p: 2.7, c: 130 },
];

const GAUGE_MAX = 25; // g protein per 100 cal that = 100% of calories
const CHART_MAX = 24;

function tierFor(pct: number) {
  if (pct >= 60)
    return {
      name: "Excellent",
      color: "var(--excellent)",
      text: "This is a lean, protein-dense food — exactly what you want anchoring a meal.",
    };
  if (pct >= 35)
    return {
      name: "Good",
      color: "var(--good)",
      text: "A solid protein source. Foods like this make hitting your protein target easy.",
    };
  if (pct >= 20)
    return {
      name: "Moderate",
      color: "var(--moderate)",
      text: "Some protein, but a good share of the calories come from carbs or fat. Fine as part of a meal, not your main protein.",
    };
  return {
    name: "Low",
    color: "var(--low)",
    text: "This is mostly carbs or fat, not protein. Pair it with a leaner protein source.",
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

const STYLES = `
.ppc{
  --orange:#E05A3A; --orange-dark:#BC4527; --tint:#FFE8E2; --tint-soft:#FFF5F2;
  --ink:#1A1A1A; --muted:#6B7280; --faint:#9CA3AF; --line:#ECECEC; --card:#FFFFFF; --bg:#FAFAF8;
  --excellent:#16A34A; --good:#E05A3A; --moderate:#F59E0B; --low:#9CA3AF;
}
.ppc *{box-sizing:border-box;}
.ppc{
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  max-width:680px;margin:0 auto;color:var(--ink);background:var(--bg);
  border:1px solid var(--line);border-radius:20px;padding:28px 26px;line-height:1.5;
}
.ppc h2{font-size:24px;font-weight:800;margin:0 0 4px;letter-spacing:-.01em;}
.ppc .sub{color:var(--muted);font-size:15px;margin:0 0 22px;}
.ppc .inputs{display:flex;gap:14px;flex-wrap:wrap;}
.ppc .field{flex:1;min-width:140px;}
.ppc label{display:block;font-size:13px;font-weight:700;color:var(--muted);margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em;}
.ppc input{
  width:100%;font-size:20px;font-weight:700;color:var(--ink);background:var(--card);
  border:2px solid var(--line);border-radius:12px;padding:12px 14px;outline:none;font-family:inherit;
}
.ppc input:focus{border-color:var(--orange);}
.ppc .picks{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px;}
.ppc .pick{
  font-size:13px;font-weight:600;color:var(--ink);background:var(--card);
  border:1px solid var(--line);border-radius:20px;padding:7px 13px;cursor:pointer;transition:.15s;
}
.ppc .pick:hover{border-color:var(--orange);background:var(--tint-soft);}

.ppc .result{margin-top:22px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;}
.ppc .stats{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;}
.ppc .stat{flex:1;min-width:120px;}
.ppc .stat .num{font-size:34px;font-weight:800;line-height:1;letter-spacing:-.02em;}
.ppc .stat .lbl{font-size:13px;color:var(--muted);margin-top:5px;}
.ppc .badge{
  display:inline-flex;align-items:center;gap:7px;font-size:15px;font-weight:800;
  padding:9px 15px;border-radius:24px;color:#fff;white-space:nowrap;
}
.ppc .badge .dot{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.85);}

.ppc .gauge{margin-top:20px;}
.ppc .gauge-track{position:relative;height:14px;border-radius:8px;overflow:hidden;display:flex;}
.ppc .gauge-track span{height:100%;}
.ppc .z-low{background:#E5E7EB;flex:20;}
.ppc .z-mod{background:#FCD9A6;flex:15;}
.ppc .z-good{background:#FFC3AC;flex:25;}
.ppc .z-exc{background:#BBF7D0;flex:40;}
.ppc .marker{position:absolute;top:-6px;width:4px;height:26px;background:var(--ink);border-radius:3px;transform:translateX(-2px);transition:left .35s ease;}
.ppc .gauge-scale{display:flex;justify-content:space-between;font-size:11px;color:var(--faint);margin-top:7px;}

.ppc .verdict-text{font-size:14px;color:var(--muted);margin-top:14px;}
.ppc .verdict-text b{color:var(--ink);}

.ppc .chart{margin-top:26px;}
.ppc .chart h3{font-size:16px;font-weight:800;margin:0 0 3px;}
.ppc .chart .chart-sub{font-size:13px;color:var(--muted);margin:0 0 16px;}
.ppc .row{display:flex;align-items:center;gap:10px;margin-bottom:9px;}
.ppc .row .name{width:150px;font-size:13px;font-weight:600;text-align:right;flex-shrink:0;color:var(--ink);}
.ppc .row .bar-wrap{flex:1;background:#F1F1EE;border-radius:6px;height:22px;overflow:hidden;}
.ppc .row .bar{height:100%;border-radius:6px;background:var(--orange);transition:width .4s ease;}
.ppc .row .val{width:42px;font-size:13px;font-weight:700;flex-shrink:0;}
.ppc .row.you .name{color:var(--orange-dark);font-weight:800;}
.ppc .row.you .bar{background:linear-gradient(90deg,var(--orange),var(--orange-dark));}
.ppc .row.you .val{color:var(--orange-dark);}
.ppc .you-tag{font-size:10px;font-weight:800;color:#fff;background:var(--orange);border-radius:4px;padding:2px 6px;margin-left:6px;vertical-align:middle;}

.ppc .foot{font-size:12px;color:var(--faint);margin-top:22px;border-top:1px solid var(--line);padding-top:14px;}

@media (max-width:480px){
  .ppc{padding:22px 18px;}
  .ppc .row .name{width:104px;font-size:12px;}
  .ppc .stat .num{font-size:28px;}
}
`;

export default function ProteinPerCalorieCalculator() {
  const [protein, setProtein] = useState("31");
  const [calories, setCalories] = useState("165");

  const p = parseFloat(protein) || 0;
  const c = parseFloat(calories) || 0;
  const valid = c > 0;

  const per100 = valid ? (p / c) * 100 : 0;
  const pct = valid ? Math.min((p * 4) / c * 100, 100) : 0;
  const tier = valid ? tierFor(pct) : null;
  const markerLeft = valid ? Math.max(0, Math.min((per100 / GAUGE_MAX) * 100, 100)) : 0;

  const rows = FOODS.map((f) => ({ name: f.name, per100: (f.p / f.c) * 100, you: false }));
  if (valid) rows.push({ name: "Your food", per100, you: true });
  rows.sort((a, b) => b.per100 - a.per100);

  return (
    <div className="ppc">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <h2>Protein-Per-Calorie Calculator</h2>
      <p className="sub">
        Enter any food&apos;s protein and calories to see how protein-dense it really is — and how it ranks.
      </p>

      <div className="inputs">
        <div className="field">
          <label htmlFor="ppc-protein">Protein (g)</label>
          <input
            id="ppc-protein"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ppc-calories">Calories</label>
          <input
            id="ppc-calories"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
      </div>

      <div className="picks">
        {PICKS.map((pk) => (
          <button
            key={pk.label}
            type="button"
            className="pick"
            onClick={() => {
              setProtein(String(pk.p));
              setCalories(String(pk.c));
            }}
          >
            {pk.label}
          </button>
        ))}
      </div>

      <div className="result">
        <div className="stats">
          <div className="stat">
            <div className="num">
              {valid ? (
                <>
                  {round1(per100)}
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>g</span>
                </>
              ) : (
                "–"
              )}
            </div>
            <div className="lbl">protein per 100 calories</div>
          </div>
          <div className="stat">
            <div className="num">
              {valid ? (
                <>
                  {Math.round(pct)}
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>%</span>
                </>
              ) : (
                "–"
              )}
            </div>
            <div className="lbl">of calories from protein</div>
          </div>
          <div className="stat" style={{ flex: "0 0 auto" }}>
            <span className="badge" style={{ background: valid ? tier!.color : "var(--muted)" }}>
              <span className="dot"></span>
              <span>{valid ? tier!.name : "Enter calories"}</span>
            </span>
          </div>
        </div>

        <div className="gauge">
          <div className="gauge-track">
            <span className="z-low"></span>
            <span className="z-mod"></span>
            <span className="z-good"></span>
            <span className="z-exc"></span>
            <div className="marker" style={{ left: `${markerLeft}%` }}></div>
          </div>
          <div className="gauge-scale">
            <span>Low</span>
            <span>Moderate</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        <p className="verdict-text">
          {valid ? (
            <>
              <b>{tier!.name}.</b> {tier!.text}
            </>
          ) : (
            "Enter a food’s protein and calories to see its ratio."
          )}
        </p>
      </div>

      <div className="chart">
        <h3>How it ranks against common foods</h3>
        <p className="chart-sub">Grams of protein per 100 calories — higher is more protein-dense.</p>
        <div>
          {rows.map((item, i) => {
            const w = Math.max(2, Math.min((item.per100 / CHART_MAX) * 100, 100));
            return (
              <div className={"row" + (item.you ? " you" : "")} key={item.you ? "your-food" : `${item.name}-${i}`}>
                <div className="name">
                  {item.name}
                  {item.you && <span className="you-tag">YOU</span>}
                </div>
                <div className="bar-wrap">
                  <div className="bar" style={{ width: `${w}%` }}></div>
                </div>
                <div className="val">{round1(item.per100)}g</div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="foot">
        A &quot;good&quot; protein-to-calorie ratio means more of a food&apos;s calories come from protein. As a rule of
        thumb, aim for foods where protein makes up at least a third of the calories (≈9 g per 100 cal or more). Protein
        has 4 calories per gram. Reference values are approximate and vary by cut, brand, and preparation.
      </p>
    </div>
  );
}
