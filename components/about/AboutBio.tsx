/*
 * Bio — the illustration in the rail, the narrative beside it.
 *
 * Same treatment the home About section gives the same file: 4:5,
 * top-anchored so object-cover crops from the bottom, hard edge. Repeating
 * the treatment rather than inventing a second one is deliberate — it is
 * the only real image in the project, and two different crops of it would
 * read as two different pictures.
 *
 * The figure caption is bilingual, in the secondary tier, and sits below
 * the frame rather than over it: nothing is laid on top of an image
 * anywhere else on the site.
 */
import Image from "next/image";
import Spread from "@/components/site/Spread";
import { about } from "@/content/about";

export default function AboutBio() {
  return (
    <Spread
      tight
      rail={
        <figure className="m-0 w-full">
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-media bg-slot">
            <Image
              src={about.image.src}
              alt={about.image.alt}
              fill
              sizes="(max-width: 860px) 100vw, 26vw"
              className="object-cover object-top"
            />
          </div>
          <figcaption className="mt-4 flex flex-col gap-1">
            <span>{about.image.caption.latin}</span>
            <span lang="ja" className="font-ja tracking-[0.14em] text-muted-3">
              {about.image.caption.ja}
            </span>
          </figcaption>
        </figure>
      }
    >
      <div className="flex flex-col gap-[1.4em] font-mono-ui text-meta/[1.85] text-muted-2">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} data-reveal="">
            {paragraph}
          </p>
        ))}
      </div>
    </Spread>
  );
}
