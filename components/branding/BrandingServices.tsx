/*
 * What the work covers — the reference's four-cell grid, rebuilt on the
 * page's own spread.
 *
 * The rules are drawn as ONE hairline cross rather than borders per cell:
 * a border on every cell doubles up where two meet, which reads heavier on
 * the inner lines than the outer ones and gives the grid an accidental
 * frame. A single vertical and a single horizontal, both absolutely
 * positioned, keep every rule exactly one pixel — and both disappear below
 * 860px where the grid becomes a single column and there is nothing left
 * to divide.
 */
import Spread from "@/components/site/Spread";
import { branding } from "@/content/branding";

export default function BrandingServices() {
  return (
    <Spread eyebrow={branding.servicesEyebrow}>
      <div className="relative grid grid-cols-2 gap-x-[clamp(28px,4vw,72px)] gap-y-[clamp(48px,7vh,96px)] max-b860:grid-cols-1">
        {/* The cross — one rule each way, centred on the gaps */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-line-09 max-b860:hidden"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-line-09 max-b860:hidden"
        />

        {branding.services.map((service) => (
          <div key={service.title} data-reveal="">
            <h2 className="text-[clamp(20px,1.7vw,28px)]/[1.2] font-semibold tracking-[-0.015em] text-ink">
              {service.title}
            </h2>
            <p className="mt-4 font-mono-ui text-meta/[1.7] text-muted-2">
              {service.body}
            </p>
          </div>
        ))}
      </div>
    </Spread>
  );
}
