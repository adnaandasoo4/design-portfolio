"use client";

/*
 * Single GSAP registration point (§A7). Import gsap/plugins from here only —
 * never from "gsap" directly — so registration happens exactly once.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, SplitText };
