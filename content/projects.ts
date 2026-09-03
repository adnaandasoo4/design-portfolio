/*
 * Work-list index content (§A6 #4). Copy is verbatim from the reference
 * design. Pill images are real photos in /public/assets (§A8).
 */
export type Project = {
  /** Row display name (centered, oversized) */
  name: string;
  /** Marquee latin name (may differ from row name) */
  marqueeName: string;
  /** Marquee Japanese name (lang="ja") */
  jaName: string;
  /** Left side label */
  industry: string;
  /** Right side label — two digits; rendered as ’NN */
  year: string;
  /** Pill thumbnail (~7:3, radius 999px) */
  image: string;
  /** Link target */
  href: string;
};

/* Authored order is irrelevant — `projects` below is sorted, so a new row
   can be appended here and lands in the right place on its own. */
const ROWS: Project[] = [
  {
    name: "Ronny",
    marqueeName: "Ronny",
    jaName: "ロニー",
    industry: "Brand",
    year: "24",
    image: "/assets/pill-ronny-2.png",
    href: "/works",
  },
  {
    name: "Elkhateeb",
    marqueeName: "Salem Elkhateeb",
    jaName: "セイラム・エルカティーブ",
    industry: "Portfolio",
    year: "26",
    image: "/assets/pill-elkhateeb-2.png",
    href: "/works",
  },
  {
    name: "Nike Clone",
    marqueeName: "Nike Clone",
    jaName: "ナイキ・クローン",
    industry: "Concept",
    year: "25",
    image: "/assets/pill-nike-clone-2.png",
    href: "/works",
  },
  {
    name: "Sofive",
    marqueeName: "Sofive Tracker",
    jaName: "ソファイブ・トラッカー",
    industry: "Product",
    year: "26",
    image: "/assets/pill-sofive-2.png",
    href: "/works",
  },
];

/**
 * Newest first (user, 2026-09-03). Sorted rather than hand-ordered: the row
 * order IS the year order, and a list that only happens to be sorted stops
 * being sorted the first time someone appends to it.
 *
 * Array#sort is stable per spec, so rows sharing a year keep the order they
 * were authored in above — the only part still decided by hand.
 */
export const projects: Project[] = [...ROWS].sort(
  (a, b) => Number(b.year) - Number(a.year),
);
