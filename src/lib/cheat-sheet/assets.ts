/**
 * Font + image asset loading for the cheat-sheet PDF.
 *
 * Fonts and images are read from the repo's /public dir by absolute path. For
 * this to work in Vercel's serverless functions, the files are bundled via
 * `outputFileTracingIncludes` in next.config.ts. Missing image files degrade
 * gracefully (publicAsset returns null) so the PDF always renders.
 */
import path from "path";
import fs from "fs";
import { Font } from "@react-pdf/renderer";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const FONT_DIR = path.join(PUBLIC_DIR, "fonts");

let fontsRegistered = false;

export function registerFonts(): void {
  if (fontsRegistered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FONT_DIR, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "Inter-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONT_DIR, "Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // Keep words intact — no hyphenation in a quick-reference doc.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

/**
 * Absolute path to a file under /public, or null if it doesn't exist. Use for
 * optional <Image> slots so a not-yet-added asset never breaks rendering.
 */
export function publicAsset(relPath: string): string | null {
  const abs = path.join(PUBLIC_DIR, relPath);
  try {
    return fs.existsSync(abs) ? abs : null;
  } catch {
    return null;
  }
}
