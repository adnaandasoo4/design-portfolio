/*
 * Works page content (§A9 brief). Index data is verbatim from the reference
 * scaffold (Works Adnaan Dasoo V3.dc.html) — 6 items; images are labeled
 * placeholders until real art lands.
 */

export type WorkCard = {
  title: string;
  /** Discipline half of the meta line, e.g. "product" */
  kind: string;
  /** Four-digit year. The sort key AND the second half of the meta line —
   *  it used to live inside a single "product · 2025" string, which meant
   *  the only copy of the year was one the code could not sort on. */
  year: number;
  ja: string;
  image: string;
};

/**
 * Newest first (user, 2026-09-03). Sorted rather than hand-ordered: the card
 * order IS the year order, and a list that only happens to be sorted stops
 * being sorted the first time someone appends to it. WorksIndex numbers the
 * cards from their array position, so the printed index follows.
 *
 * Array#sort is stable per spec, so cards sharing a year keep the order they
 * were authored in — the only part still decided by hand.
 */
function sortedCards(cards: WorkCard[]): WorkCard[] {
  return [...cards].sort((a, b) => b.year - a.year);
}

export const works = {
  marquee: { latin: "WORKS", ja: "ワークス" },
  headerEyebrow: { latin: "( selected works )", ja: "作品" },
  count: "( 06 )",
  /* Authored order is irrelevant — `cards` is sorted below. */
  cards: sortedCards([
    {
      title: "full time",
      kind: "product",
      year: 2025,
      ja: "フルタイム",
      image: "/assets/work-full-time.png",
    },
    {
      title: "ronny",
      kind: "portfolio",
      year: 2025,
      ja: "ロニー",
      image: "/assets/work-ronny.png",
    },
    {
      title: "new arrivals",
      kind: "concept",
      year: 2024,
      ja: "ニューアライバル",
      image: "/assets/work-new-arrivals.png",
    },
    {
      title: "salem elkhateeb",
      kind: "portfolio",
      year: 2025,
      ja: "セイラム・エルハティーブ",
      image: "/assets/work-salem-elkhateeb.png",
    },
    {
      title: "portfolio v2",
      kind: "web",
      year: 2024,
      ja: "ポートフォリオ v2",
      image: "/assets/work-portfolio-v2.png",
    },
    {
      title: "umbc msa",
      kind: "web",
      year: 2024,
      ja: "ユーエムビーシー・エムエスエー",
      image: "/assets/work-umbc-msa.png",
    },
  ]),
};
