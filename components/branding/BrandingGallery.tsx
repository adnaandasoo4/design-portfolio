/*
 * In practice — a two-up image pair closing the page before the footer.
 *
 * Sits in the shared Spread like every other section, so the pair starts on
 * the same left edge as the services grid and the process list rather than
 * running full-bleed; the band above is the page's only full-bleed moment
 * and stays the only one.
 */
import Image from "next/image";
import Spread from "@/components/branding/Spread";
import { branding } from "@/content/branding";

export default function BrandingGallery() {
  return (
    <Spread eyebrow={branding.galleryEyebrow} tight>
      <div className="grid grid-cols-2 gap-[clamp(16px,2.4vw,40px)] max-b700:grid-cols-1">
        {branding.gallery.map((item) => (
          <figure key={item.image} data-reveal="" className="m-0">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-media bg-slot">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 font-mono-ui text-meta/[1.6] text-muted-2">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </Spread>
  );
}
