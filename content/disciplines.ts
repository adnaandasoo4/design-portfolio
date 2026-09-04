/*
 * Disciplines rows (§A6 #5) — copy verbatim from the reference `roles[]`.
 *
 * All three rows got new supporting work (user, 2026-09-03).
 *
 * FILENAMES CARRY THE SUBJECT, not just the row — disc-<row>-<subject>.png.
 * That is a cache rule, not a tidiness one. The first swap renamed the files
 * and the pictures appeared; the second kept the paths and overwrote the
 * bytes, reasoning that a file named for its row should not be renamed when
 * the picture in it changes. The site then served the new images correctly
 * and every browser that had already loaded the page kept showing the old
 * ones, because nothing about the URL had changed to make them ask again.
 *
 * So: when the picture changes, the filename changes with it. Putting the
 * subject in the name is what makes that automatic rather than something
 * to remember.
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
    name: "Visual Identity",
    jaName: "ビジュアルアイデンティティ",
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
    image: "/assets/disc-visual-identity-sinua.png",
    line: false,
  },
  {
    numeral: "02",
    name: "Digital Brand",
    jaName: "デジタルブランド",
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
    image: "/assets/disc-digital-brand-diconf.png",
    line: true,
  },
  {
    numeral: "03",
    name: "Development",
    jaName: "開発",
    description:
      "Production-grade builds in React and TypeScript — fast, accessible front-ends where the craft survives contact with real users.",
    tags: ["react", "next.js", "typescript", "gsap", "supabase", "ci / cd"],
    image: "/assets/disc-development-laptop.png",
    line: true,
  },
];
