/*
 * Works page content (§A9 brief). Index data is verbatim from the reference
 * scaffold (Works Adnaan Dasoo V3.dc.html) — 6 items; images are labeled
 * placeholders until real art lands.
 */

export type WorkCard = {
  title: string;
  /** mono meta line, e.g. "product · 2025" */
  meta: string;
  ja: string;
  image: string;
};

export const works = {
  marquee: { latin: "WORKS", ja: "ワークス" },
  headerEyebrow: { latin: "( selected works )", ja: "作品" },
  count: "( 06 )",
  cards: [
    {
      title: "full time",
      meta: "product · 2025",
      ja: "フルタイム",
      image: "/assets/work-full-time.png",
    },
    {
      title: "ronny",
      meta: "portfolio · 2025",
      ja: "ロニー",
      image: "/assets/work-ronny.png",
    },
    {
      title: "new arrivals",
      meta: "concept · 2024",
      ja: "ニューアライバル",
      image: "/assets/work-new-arrivals.png",
    },
    {
      title: "salem elkhateeb",
      meta: "portfolio · 2025",
      ja: "セイラム・エルハティーブ",
      image: "/assets/work-salem-elkhateeb.png",
    },
    {
      title: "portfolio v2",
      meta: "web · 2024",
      ja: "ポートフォリオ v2",
      image: "/assets/work-portfolio-v2.png",
    },
    {
      title: "umbc msa",
      meta: "web · 2024",
      ja: "ユーエムビーシー・エムエスエー",
      image: "/assets/work-umbc-msa.png",
    },
  ] satisfies WorkCard[],
};
