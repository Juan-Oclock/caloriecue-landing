/**
 * Display metadata for the curated blog topics shown as filter pills and
 * card badges on the Guides page. Client-safe (no fs) so both Server and
 * Client Components can import it.
 *
 * `bg` / `fg` are the badge colours from the Guides design; each pair
 * clears WCAG AA for 11px bold text.
 */
export interface TagMeta {
  label: string;
  bg: string;
  fg: string;
}

export const TAG_META: Record<string, TagMeta> = {
  protein: { label: "Protein", bg: "#FFE4E8", fg: "#B8203A" },
  "weight-loss": { label: "Weight loss", bg: "#FBE3D7", fg: "#B8471C" },
  "calorie-tracking": { label: "Calorie tracking", bg: "#DBEAFE", fg: "#2456B8" },
  nutrition: { label: "Nutrition", bg: "#E3F1E4", fg: "#2E7D3E" },
  ozempic: { label: "GLP-1", bg: "#EFE4F7", fg: "#7A3FA6" },
  "grocery-list": { label: "Grocery lists", bg: "#FFF5D1", fg: "#8A5F00" },
  "meal-prep": { label: "Meal prep", bg: "#F1EAE2", fg: "#6B5847" },
  tools: { label: "Tools", bg: "#EEE8E1", fg: "#5E544D" },
  "lose-weight": { label: "Lose weight", bg: "#FBE3D7", fg: "#B8471C" },
  "build-muscle": { label: "Build muscle", bg: "#DBEAFE", fg: "#2456B8" },
  maintain: { label: "Maintain", bg: "#E3F1E4", fg: "#2E7D3E" },
  "gain-weight": { label: "Gain weight", bg: "#EFE4F7", fg: "#7A3FA6" },
};

/** Topics shown as filter pills, in display order. */
export const CURATED_TOPICS = [
  "protein",
  "weight-loss",
  "calorie-tracking",
  "nutrition",
  "ozempic",
  "grocery-list",
  "meal-prep",
  "tools",
] as const;

const FALLBACK: TagMeta = { label: "", bg: "#EEE8E1", fg: "#5E544D" };

/** Human label + colours for any tag; unknown tags get a title-cased label. */
export function getTagMeta(tag: string): TagMeta {
  const known = TAG_META[tag];
  if (known) return known;
  const label = tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { ...FALLBACK, label };
}

/**
 * The tag to show as a card's badge: the first curated topic the post
 * carries, otherwise its first tag.
 */
export function primaryTag(tags: string[]): string | undefined {
  return tags.find((t) => (CURATED_TOPICS as readonly string[]).includes(t)) ?? tags[0];
}
