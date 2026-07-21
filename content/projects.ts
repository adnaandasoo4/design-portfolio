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

export const projects: Project[] = [
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
