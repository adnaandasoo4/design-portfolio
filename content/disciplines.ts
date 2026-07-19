/*
 * Disciplines rows (§A6 #5) — copy verbatim from the reference `roles[]`.
 */
export type Discipline = {
  numeral: string;
  name: string;
  jaName: string;
  description: string;
  tags: string[];
  image: string;
  /** Top hairline rule (rows 2–3 only) */
  line: boolean;
};

export const disciplinesEyebrow = "disciplines";

export const disciplinesIntro =
  "Strategy, design, and development — one continuous craft from the first idea to the shipped product.";

export const disciplines: Discipline[] = [
  {
    numeral: "01",
    name: "brand strategy",
    jaName: "ブランド戦略",
    description:
      "Positioning, voice, and visual identity — finding what makes a brand worth noticing and building the system that carries it everywhere.",
    tags: [
      "identity",
      "positioning",
      "voice & tone",
      "art direction",
      "naming",
      "brand systems",
    ],
    image: "/assets/disc-brand-strategy.png",
    line: false,
  },
  {
    numeral: "02",
    name: "digital design",
    jaName: "デジタルデザイン",
    description:
      "Interfaces, motion, and art direction — screens that feel considered in every state, from the first paint to the edge case.",
    tags: [
      "ui / ux",
      "design systems",
      "motion",
      "prototyping",
      "typography",
      "interaction",
    ],
    image: "/assets/disc-digital-design.png",
    line: true,
  },
  {
    numeral: "03",
    name: "development",
    jaName: "開発",
    description:
      "Production-grade builds in React and TypeScript — fast, accessible front-ends where the craft survives contact with real users.",
    tags: ["react", "next.js", "typescript", "gsap", "supabase", "ci / cd"],
    image: "/assets/disc-development.png",
    line: true,
  },
];
