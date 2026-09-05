"use client";

/*
 * Work List (§A6 #4) — project index: header row, 4 hoverable marquee rows,
 * "See All" CTA. Hover/focus choreography (§A5 Work-list Row + Marquee,
 * §A7 #10/#11) is pure CSS (group-hover / group-focus-visible + the
 * `wlist-marq` keyframes in globals.css); the on-enter reveal (§A7 #9) is
 * GSAP inside the matchMedia default branch.
 *
 * Colour: the row names are `text-ink` and the marquee band is the site's
 * INVERTED surface idiom — `bg-ink` under `text-bg` labels. Both were raw
 * `white` until 2026-09-03, which left the names invisible and the band
 * unreadable on the light theme; the tokens invert with it for free.
 */

import { Fragment, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";
import ArrowLink from "@/components/site/ArrowLink";
import { useVeiledRoute } from "@/components/site/RouteVeil";
import { projects, type Project } from "@/content/projects";
import { workList } from "@/content/copy";

/** One marquee group: 5 × [pill image + bilingual label stack]. The track
 *  holds two identical groups so the −50% keyframe loops seamlessly. */
function MarqueeGroup({ project }: { project: Project }) {
  return (
    <span className="flex items-center gap-[clamp(1.875rem,3vw,3.75rem)] pr-[clamp(1.875rem,3vw,3.75rem)]">
      {Array.from({ length: 5 }, (_, i) => (
        <Fragment key={i}>
          <span className="relative block h-[clamp(4.625rem,13vh,7.375rem)] w-[clamp(11.5rem,21vw,17rem)] shrink-0 overflow-hidden rounded-pill">
            <Image
              src={project.image}
              alt=""
              fill
              sizes="272px"
              loading="lazy"
              className="object-cover"
            />
          </span>
          <span className="flex shrink-0 flex-col gap-[0.4375rem]">
            <span className="font-semibold leading-none tracking-[-0.01em] text-bg text-[clamp(1.5rem,2.1vw,2.25rem)]">
              {project.marqueeName}
            </span>
            <span
              lang="ja"
              className="font-ja font-medium leading-none text-muted-ja text-[clamp(0.8125rem,1vw,1.0625rem)]"
            >
              {project.jaName}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export default function WorkList() {
  const sectionRef = useRef<HTMLElement>(null);
  const goRoute = useVeiledRoute();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Default branch = the full motion design (§A7 rule) — row reveal #9.
      mm.add(MQ.motionOk, () => {
        gsap.from("[data-wrow]", {
          y: 32,
          opacity: 0,
          duration: 0.6,
          ease: EASE.outQuart,
          stagger: 0.06,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        });
      });

      // Reduced branch — instant show; marquee freeze + transition kills are
      // handled in CSS (globals.css + motion-reduce: utilities below).
      mm.add(MQ.reduced, () => {
        gsap.set("[data-wrow]", { clearProps: "opacity,transform" });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="worklist"
      aria-label="Work list"
      ref={sectionRef}
      className="relative z-(--z-section) bg-bg pt-[clamp(3.5rem,8vh,6.875rem)] pb-[clamp(3.5rem,8vh,6.25rem)]"
    >
      {/* Header row — Industry / Timeline */}
      <div className="flex items-baseline justify-between px-9 pb-4 max-b700:px-5.5">
        <span className="font-normal text-[0.8125rem] leading-none tracking-[0.04em] text-muted-3">
          {workList.headerLeft}
        </span>
        <span className="font-normal text-[0.8125rem] leading-none tracking-[0.04em] text-muted-3">
          {workList.headerRight}
        </span>
      </div>

      {/* Project rows */}
      {projects.map((p) => (
        /* Was a bare <a>, which meant every work row triggered a full page
           RELOAD — no client navigation and no veil. Routed through the veil
           like every other internal link (2026-09-03). */
        <Link
          key={p.name}
          href={p.href}
          onClick={goRoute(p.href)}
          data-wrow
          className="group relative flex h-[clamp(8rem,21vh,12.25rem)] cursor-pointer items-center justify-center overflow-hidden border-t border-line-09 max-b700:h-27.5"
        >
          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-[1.25rem] leading-none text-ink-1 max-b700:left-5.5 max-b700:text-[0.6875rem]">
            {p.industry}
          </span>

          <span
            data-wrow-name
            className="font-medium leading-none tracking-[-0.02em] text-ink text-[clamp(3.25rem,6.2vw,7.875rem)] max-b700:text-[2.375rem]"
          >
            {p.name}
          </span>

          <span className="absolute right-9 top-1/2 -translate-y-1/2 text-[1.25rem] leading-none text-ink-1 max-b700:right-5.5 max-b700:text-[0.6875rem]">
            <span className="mr-[0.1875rem] text-muted-2">’</span>
            {p.year}
          </span>

          {/* Marquee band — clip-wipes open on hover/focus (§A7 #10) */}
          <span
            aria-hidden="true"
            data-wrow-marq
            className="pointer-events-none absolute inset-0 flex items-center bg-ink [clip-path:inset(50%_0_50%_0)] transition-[clip-path] duration-[0.55s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)] motion-reduce:transition-none"
          >
            {/* Track — 32s linear loop (#11) + 30px lift on reveal */}
            <span
              data-wrow-track
              className="flex w-max items-center [animation:wlist-marq_32s_linear_infinite] [animation-play-state:paused] [translate:0_1.875rem] transition-[translate] duration-[0.7s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[animation-play-state:running] group-hover:[translate:0_0] group-focus-visible:[animation-play-state:running] group-focus-visible:[translate:0_0] motion-reduce:transition-none motion-reduce:[translate:none]"
            >
              <MarqueeGroup project={p} />
              <MarqueeGroup project={p} />
            </span>
          </span>
        </Link>
      ))}

      {/* CTA — See All */}
      <div className="flex justify-center pt-[clamp(4rem,9vh,7.5rem)]">
        <ArrowLink href={workList.ctaHref}>{workList.ctaText}</ArrowLink>
      </div>
    </section>
  );
}
