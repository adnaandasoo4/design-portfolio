"use client";

/*
 * Single GSAP registration point (§A7). Import gsap/plugins from here only —
 * never from "gsap" directly — so registration happens exactly once.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
