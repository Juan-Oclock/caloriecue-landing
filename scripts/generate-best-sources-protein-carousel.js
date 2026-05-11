const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(
  ROOT,
  "public/social/best-sources-of-protein-carousel"
);

const WIDTH = 1080;
const HEIGHT = 1350;

const colors = {
  cream: "#f6f0e6",
  cream2: "#fffaf0",
  ink: "#0c1412",
  green: "#143616",
  green2: "#315b1f",
  sage: "#6f853e",
  orange: "#f05a1a",
  orange2: "#ff7a2e",
  red: "#cf3d2d",
  tan: "#dfcfac",
  muted: "#67705c",
  white: "#ffffff",
};

function xml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dataUri(buffer, mime = "image/png") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function estimateChars(width, size, weight = 500) {
  const weightFactor = weight >= 800 ? 0.55 : 0.5;
  return Math.max(8, Math.floor(width / (size * weightFactor)));
}

function wrap(text, width, size, weight = 500) {
  const max = estimateChars(width, size, weight);
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function textBlock({
  text,
  lines,
  x,
  y,
  width,
  size,
  lineHeight = Math.round(size * 1.14),
  weight = 500,
  fill = colors.ink,
  anchor = "start",
  caps = false,
  letterSpacing = 0,
}) {
  const actualLines = lines || wrap(text, width, size, weight);
  const tspans = actualLines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${xml(caps ? line.toUpperCase() : line)}</tspan>`;
    })
    .join("");

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${letterSpacing}" dominant-baseline="text-before-edge">${tspans}</text>`;
}

function header(index, theme = "light") {
  const fill = theme === "dark" ? colors.cream : colors.green;
  const soft = theme === "dark" ? "#d8e4c5" : colors.muted;
  return `
    <text x="76" y="58" font-size="25" font-weight="900" fill="${fill}">CalorieCue</text>
    <text x="1004" y="58" text-anchor="end" font-size="18" font-weight="800" fill="${soft}">${String(index).padStart(2, "0")}/06</text>
  `;
}

function dotGrid(theme = "light") {
  const fill = theme === "dark" ? "#f2ead8" : "#315b1f";
  let dots = "";
  for (let y = 166; y <= 1160; y += 64) {
    for (let x = 76; x <= 1006; x += 64) {
      dots += `<circle cx="${x}" cy="${y}" r="2.1" fill="${fill}" opacity="${theme === "dark" ? 0.24 : 0.15}"/>`;
    }
  }
  return dots;
}

function pill(x, y, w, h, text, opts = {}) {
  const fill = opts.fill || colors.green;
  const color = opts.color || colors.cream;
  const size = opts.size || 24;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>
    <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-size="${size}" font-weight="850" fill="${color}">${xml(text)}</text>
  `;
}

function chip(x, y, text, opts = {}) {
  const w = opts.width || Math.max(210, text.length * 17 + 48);
  const fill = opts.fill || colors.cream2;
  const stroke = opts.stroke || "#d4c5a7";
  const dot = opts.dot || colors.orange;
  const color = opts.color || colors.ink;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="64" rx="32" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <circle cx="${x + 34}" cy="${y + 32}" r="9" fill="${dot}"/>
    <text x="${x + 58}" y="${y + 40}" font-size="25" font-weight="850" fill="${color}">${xml(text)}</text>
  `;
}

function arrowDownIcon(x, y, color = colors.orange) {
  return `
    <circle cx="${x}" cy="${y}" r="24" fill="${color}"/>
    <path d="M${x} ${y - 14}v24M${x - 10} ${y + 2}l10 10 10-10" fill="none" stroke="${colors.white}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

function cameraIcon(x, y, color = colors.green) {
  return `
    <rect x="${x - 25}" y="${y - 18}" width="50" height="38" rx="11" fill="none" stroke="${color}" stroke-width="5"/>
    <path d="M${x - 11} ${y - 18}l6-9h15l6 9" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${x}" cy="${y + 1}" r="9" fill="none" stroke="${color}" stroke-width="5"/>
  `;
}

function brush(x, y, w, color = colors.orange) {
  return `<path d="M${x} ${y} C ${x + w * 0.24} ${y - 22}, ${x + w * 0.66} ${y - 10}, ${x + w} ${y - 17}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" opacity="0.95"/>`;
}

function imageCard(id, imageHref, x, y, w, h, opts = {}) {
  const rx = opts.rx ?? 34;
  const opacity = opts.opacity ?? 1;
  return `
    <defs>
      <clipPath id="${id}">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>
      </clipPath>
    </defs>
    <rect x="${x + 12}" y="${y + 14}" width="${w}" height="${h}" rx="${rx}" fill="#000" opacity="0.12"/>
    <image href="${imageHref}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})" opacity="${opacity}"/>
  `;
}

function phoneMockup(phoneHref, x, y, scale = 1) {
  const w = 250 * scale;
  const h = 496 * scale;
  return `
    <g transform="translate(${x} ${y})">
      <rect x="17" y="20" width="${w}" height="${h}" rx="${42 * scale}" fill="#0a0f0d" opacity="0.18"/>
      <image href="${phoneHref}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
    </g>
  `;
}

function panel(x, y, w, h, opts = {}) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.rx || 26}" fill="${opts.fill || colors.cream2}" stroke="${opts.stroke || "#d5c5a8"}" stroke-width="${opts.strokeWidth || 2}" opacity="${opts.opacity || 1}"/>
  `;
}

function rankBar(x, y, label, value, color = colors.orange) {
  const max = 360;
  return `
    <text x="${x}" y="${y}" font-size="25" font-weight="900" fill="${colors.ink}">${xml(label)}</text>
    <rect x="${x}" y="${y + 23}" width="${max}" height="20" rx="10" fill="#eadfc9"/>
    <rect x="${x}" y="${y + 23}" width="${Math.round(max * value)}" height="20" rx="10" fill="${color}"/>
  `;
}

function slideShell(index, theme, content) {
  const bg = theme === "dark" ? colors.green : colors.cream;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>
    @font-face {
      font-family: 'InterVar';
      src: url(data:font/ttf;base64,${fs
        .readFileSync(path.join(ROOT, "public/social/_fonts/InterVariable.ttf"))
        .toString("base64")}) format('truetype');
      font-weight: 100 900;
    }
    text { font-family: 'InterVar', 'Inter', 'Helvetica Neue', Arial, sans-serif; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${bg}"/>
  ${dotGrid(theme)}
  ${header(index, theme)}
  ${content}
</svg>`;
}

async function buildAssets() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const coverPath = path.join(ROOT, "public/blog/best-sources-of-protein.webp");
  const phonePath = path.join(ROOT, "public/mockup-caloriecue.png");

  const coverWide = dataUri(
    await sharp(coverPath).resize(940, 360, { fit: "cover", position: "right" }).png().toBuffer()
  );
  const coverTall = dataUri(
    await sharp(coverPath).resize(430, 575, { fit: "cover", position: "right" }).png().toBuffer()
  );
  const coverHero = dataUri(
    await sharp(coverPath).resize(1080, 540, { fit: "cover", position: "right" }).png().toBuffer()
  );
  const phone = dataUri(await sharp(phonePath).resize(360, 714).png().toBuffer());

  const slides = [
    slideShell(
      1,
      "light",
      `
      ${imageCard("hero1", coverHero, 0, 92, 1080, 502, { rx: 0, opacity: 1 })}
      <rect x="0" y="92" width="1080" height="502" fill="${colors.cream}" opacity="0.30"/>
      <rect x="0" y="498" width="1080" height="135" fill="${colors.cream}"/>
      ${pill(75, 630, 250, 55, "PROTEIN SOURCES", { fill: colors.green, color: colors.cream, size: 21 })}
      ${textBlock({
        lines: ["Let me save", "you hours"],
        x: 75,
        y: 711,
        width: 900,
        size: 106,
        lineHeight: 114,
        weight: 900,
      })}
      ${brush(78, 960, 520)}
      ${textBlock({
        lines: ["of researching the 'best'", "protein sources"],
        x: 76,
        y: 1050,
        width: 760,
        size: 45,
        lineHeight: 55,
        weight: 850,
        fill: colors.green,
      })}
      ${arrowDownIcon(617, 1111)}
      <text x="76" y="1251" font-size="26" font-weight="900" fill="${colors.orange}">CalorieCue</text>
      `
    ),

    slideShell(
      2,
      "dark",
      `
      ${imageCard("photo2", coverTall, 605, 155, 360, 520, { rx: 38, opacity: 0.92 })}
      <rect x="600" y="151" width="370" height="530" rx="43" fill="none" stroke="${colors.cream}" stroke-width="4" opacity="0.65"/>
      ${textBlock({
        lines: ["It's not", "chicken", "breast"],
        x: 76,
        y: 205,
        width: 500,
        size: 92,
        lineHeight: 99,
        weight: 900,
        fill: colors.cream,
      })}
      <path d="M81 482 C210 438 377 449 514 410" fill="none" stroke="${colors.orange}" stroke-width="18" stroke-linecap="round"/>
      ${panel(76, 760, 928, 385, { fill: colors.cream2, rx: 32, stroke: "#efe3ca" })}
      ${textBlock({
        text:
          "Most posts say 'eat chicken breast.' That's lazy advice. The best source depends on what you're optimizing for \u2014 protein per calorie, satiety, cost, or convenience.",
        x: 117,
        y: 813,
        width: 845,
        size: 38,
        lineHeight: 52,
        weight: 760,
        fill: colors.ink,
      })}
      ${chip(118, 1211, "protein per calorie", { width: 300, fill: "#e8f0d7", dot: colors.green2 })}
      ${chip(442, 1211, "satiety", { width: 180, fill: "#e8f0d7", dot: colors.orange })}
      ${chip(645, 1211, "cost + convenience", { width: 338, fill: "#e8f0d7", dot: colors.sage })}
      `
    ),

    slideShell(
      3,
      "light",
      `
      ${pill(76, 150, 220, 55, "PURE WEIGHT LOSS", { fill: colors.orange, color: colors.white, size: 21 })}
      ${textBlock({
        lines: ["Best for", "cutting calories"],
        x: 76,
        y: 238,
        width: 900,
        size: 86,
        lineHeight: 94,
        weight: 900,
        fill: colors.green,
      })}
      ${brush(80, 449, 448)}
      ${panel(76, 535, 928, 336, { fill: colors.cream2, rx: 30 })}
      ${textBlock({
        text:
          "Egg whites \u00b7 Cod \u00b7 Shrimp \u00b7 Whey isolate. These give you the most protein with the fewest calories per gram. Boring but unbeatable.",
        x: 119,
        y: 587,
        width: 835,
        size: 39,
        lineHeight: 54,
        weight: 760,
      })}
      ${chip(88, 945, "Egg whites", { width: 236 })}
      ${chip(344, 945, "Cod", { width: 154, dot: colors.green2 })}
      ${chip(520, 945, "Shrimp", { width: 198 })}
      ${chip(740, 945, "Whey isolate", { width: 252, dot: colors.green2 })}
      ${rankBar(105, 1086, "Protein density", 0.96, colors.orange)}
      ${rankBar(105, 1182, "Calorie load", 0.24, colors.green2)}
      <text x="505" y="1137" font-size="36" font-weight="900" fill="${colors.orange}">high</text>
      <text x="505" y="1233" font-size="36" font-weight="900" fill="${colors.green2}">low</text>
      `
    ),

    slideShell(
      4,
      "dark",
      `
      ${pill(76, 150, 148, 55, "SATIETY", { fill: colors.cream, color: colors.green, size: 21 })}
      ${textBlock({
        lines: ["Best for", "staying full"],
        x: 76,
        y: 238,
        width: 850,
        size: 94,
        lineHeight: 101,
        weight: 900,
        fill: colors.cream,
      })}
      ${panel(76, 533, 928, 420, { fill: "#f5ecd8", rx: 32, stroke: "#fff6e5" })}
      ${textBlock({
        text:
          "Greek yogurt \u00b7 Cottage cheese \u00b7 Lean beef. These hit harder per calorie because of slow digestion, fat content, and texture. You eat less the rest of the day.",
        x: 119,
        y: 585,
        width: 835,
        size: 39,
        lineHeight: 54,
        weight: 760,
        fill: colors.ink,
      })}
      <g transform="translate(104 1025)">
        <rect width="250" height="145" rx="30" fill="${colors.cream}" opacity="0.96"/>
        <circle cx="65" cy="62" r="29" fill="${colors.orange}"/>
        <text x="122" y="60" font-size="24" font-weight="900" fill="${colors.green}">slow</text>
        <text x="122" y="94" font-size="24" font-weight="900" fill="${colors.green}">digestion</text>
      </g>
      <g transform="translate(415 1025)">
        <rect width="250" height="145" rx="30" fill="${colors.cream}" opacity="0.96"/>
        <circle cx="65" cy="62" r="29" fill="${colors.green2}"/>
        <text x="122" y="60" font-size="24" font-weight="900" fill="${colors.green}">fat +</text>
        <text x="122" y="94" font-size="24" font-weight="900" fill="${colors.green}">texture</text>
      </g>
      <g transform="translate(726 1025)">
        <rect width="250" height="145" rx="30" fill="${colors.cream}" opacity="0.96"/>
        <circle cx="65" cy="62" r="29" fill="${colors.sage}"/>
        <text x="122" y="60" font-size="24" font-weight="900" fill="${colors.green}">less</text>
        <text x="122" y="94" font-size="24" font-weight="900" fill="${colors.green}">snacking</text>
      </g>
      `
    ),

    slideShell(
      5,
      "light",
      `
      ${pill(76, 150, 150, 55, "REAL LIFE", { fill: colors.green, color: colors.cream, size: 21 })}
      ${textBlock({
        lines: ["Best for", "actually", "eating it"],
        x: 76,
        y: 238,
        width: 610,
        size: 89,
        lineHeight: 94,
        weight: 900,
        fill: colors.ink,
      })}
      ${imageCard("photo5", coverTall, 680, 180, 290, 465, { rx: 40, opacity: 0.96 })}
      ${panel(76, 708, 928, 402, { fill: colors.cream2, rx: 32 })}
      ${textBlock({
        text:
          "Eggs \u00b7 Chicken thighs \u00b7 Canned tuna \u00b7 Greek yogurt. Cheap, fast, no prep gymnastics. The protein you'll actually consume beats the optimal one you won't.",
        x: 119,
        y: 761,
        width: 835,
        size: 39,
        lineHeight: 54,
        weight: 760,
      })}
      ${pill(108, 1178, 175, 56, "cheap", { fill: colors.orange, color: colors.white, size: 26 })}
      ${pill(306, 1178, 144, 56, "fast", { fill: colors.green2, color: colors.white, size: 26 })}
      ${pill(473, 1178, 304, 56, "no prep gymnastics", { fill: colors.ink, color: colors.cream, size: 24 })}
      `
    ),

    slideShell(
      6,
      "dark",
      `
      ${textBlock({
        lines: ["Full ranking", "on the blog"],
        x: 76,
        y: 170,
        width: 620,
        size: 88,
        lineHeight: 97,
        weight: 900,
        fill: colors.cream,
      })}
      ${brush(80, 380, 470)}
      ${textBlock({
        lines: ["Link in pinned comment"],
        x: 78,
        y: 470,
        width: 680,
        size: 42,
        lineHeight: 52,
        weight: 850,
        fill: colors.cream,
      })}
      ${arrowDownIcon(610, 493, colors.orange)}
      ${phoneMockup(phone, 654, 205, 1.18)}
      ${panel(76, 627, 525, 292, { fill: colors.cream2, rx: 32, stroke: "#efe3ca" })}
      <text x="119" y="690" font-size="31" font-weight="900" fill="${colors.green}">CalorieCue tracks</text>
      <text x="119" y="741" font-size="31" font-weight="900" fill="${colors.green}">protein automatically</text>
      ${cameraIcon(522, 727, colors.orange)}
      <text x="119" y="825" font-size="25" font-weight="760" fill="${colors.ink}">Snap a meal. See calories and protein.</text>
      ${imageCard("photo6", coverWide, 76, 997, 928, 236, { rx: 28, opacity: 0.92 })}
      <rect x="76" y="997" width="928" height="236" rx="28" fill="${colors.green}" opacity="0.42"/>
      <text x="119" y="1091" font-size="34" font-weight="900" fill="${colors.cream}">/blog/best-sources-of-protein</text>
      `
    ),
  ];

  const pngPaths = [];
  for (let i = 0; i < slides.length; i += 1) {
    const slideNo = String(i + 1).padStart(2, "0");
    const svgPath = path.join(OUT_DIR, `slide-${slideNo}.svg`);
    const pngPath = path.join(OUT_DIR, `slide-${slideNo}.png`);
    fs.writeFileSync(svgPath, slides[i]);
    await sharp(Buffer.from(slides[i])).png().toFile(pngPath);
    pngPaths.push(pngPath);
  }

  const thumbs = await Promise.all(
    pngPaths.map((pngPath) =>
      sharp(pngPath).resize(360, 450).png().toBuffer()
    )
  );

  const gutter = 22;
  const sheetW = 3 * 360 + 4 * gutter;
  const sheetH = 2 * 450 + 3 * gutter;
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: colors.green,
    },
  })
    .composite(
      thumbs.map((input, index) => ({
        input,
        left: gutter + (index % 3) * (360 + gutter),
        top: gutter + Math.floor(index / 3) * (450 + gutter),
      }))
    )
    .png()
    .toFile(path.join(OUT_DIR, "contact-sheet.png"));

  console.log(`Wrote ${slides.length} slides to ${OUT_DIR}`);
}

buildAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
