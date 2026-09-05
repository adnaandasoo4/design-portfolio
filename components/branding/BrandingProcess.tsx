/*
 * How it runs — four numbered steps, ruled.
 *
 * The numerals reuse the site's existing tabular-nums treatment from the
 * nav menu rows, so "01…04" reads as the same device in both places. Each
 * step carries a top hairline EXCEPT the first, which would otherwise draw
 * a rule immediately under the section's own rail hairline and read as a
 * doubled line rather than a list.
 */
import Spread from "@/components/site/Spread";
import { branding } from "@/content/branding";

export default function BrandingProcess() {
  return (
    <Spread eyebrow={branding.processEyebrow} tight>
      <ol className="flex flex-col">
        {branding.process.map((step, i) => (
          <li
            key={step.numeral}
            data-reveal=""
            className={`grid grid-cols-[auto_1fr] gap-x-[clamp(1.25rem,3vw,3.5rem)] py-[clamp(1.5rem,3.4vh,2.75rem)] max-b700:grid-cols-1 max-b700:gap-y-3 ${
              i === 0 ? "pt-0" : "border-t border-line-09"
            }`}
          >
            <span
              aria-hidden="true"
              className="font-manrope text-meta leading-[1.6] text-muted-2 tabular-nums"
            >
              {step.numeral}
            </span>
            <div>
              <h2 className="text-[clamp(1.25rem,1.7vw,1.75rem)]/[1.2] font-semibold tracking-[-0.015em] text-ink">
                {step.title}
              </h2>
              <p className="mt-3 max-w-[58ch] font-manrope text-meta/[1.7] text-muted-2">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Spread>
  );
}
