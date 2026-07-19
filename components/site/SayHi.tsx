"use client";

/*
 * "Say hi" pill (§A5 [data-sayhi]). White pill → mailto. Hover/focus:
 * label swaps vertically (base −105%, overlay 105%→0) and the arrow swaps
 * diagonally toward the top-right — swap .85 / ease-out-expo (§A7 #5).
 * CSS transitions (cheap, kept under reduced motion per §A7 table).
 */
import { EMAIL, nav as navCopy } from "@/content/copy";

const LABEL =
  "col-start-1 row-start-1 block whitespace-nowrap text-[15px] font-semibold leading-5 text-bg " +
  "transition-transform duration-(--dur-swap) ease-(--ease-out-expo)";

const ARROW =
  "col-start-1 row-start-1 size-[13px] transition-transform duration-(--dur-swap) ease-(--ease-out-expo)";

function ArrowGlyph({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export default function SayHi() {
  return (
    <a
      data-sayhi=""
      href={`mailto:${EMAIL}`}
      className="group pointer-events-auto flex h-8.5 items-center gap-5 rounded-btn bg-ink pl-5.5 pr-[5px]"
    >
      {/* Vertical label swap — 20px clip window, base + overlay stacked */}
      <span className="grid h-5 overflow-hidden">
        <span
          className={`${LABEL} group-hover:-translate-y-[105%] group-focus-visible:-translate-y-[105%]`}
        >
          {navCopy.sayHi}
        </span>
        <span
          aria-hidden="true"
          className={`${LABEL} translate-y-[105%] group-hover:translate-y-0 group-focus-visible:translate-y-0`}
        >
          {navCopy.sayHi}
        </span>
      </span>

      {/* Arrow chip — diagonal swap toward top-right */}
      <span
        aria-hidden="true"
        className="grid size-6.5 place-items-center overflow-hidden rounded-chip bg-bg"
      >
        <ArrowGlyph
          className={`${ARROW} group-hover:translate-[130%_-130%] group-focus-visible:translate-[130%_-130%]`}
        />
        <ArrowGlyph
          className={`${ARROW} translate-[-130%_130%] group-hover:translate-[0px_0px] group-focus-visible:translate-[0px_0px]`}
        />
      </span>
    </a>
  );
}
