import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Divider from "@/components/sections/Divider";
import WorkList from "@/components/sections/WorkList";
import Disciplines from "@/components/sections/Disciplines";
import ContactVisual from "@/components/sections/ContactVisual";
import Footer from "@/components/site/Footer";

/*
 * Home — §A6 order: Preloader → (Nav in layout) → Hero → About → Divider →
 * Work List → Disciplines → Contact visual → Footer. One continuous #111214
 * surface; sections carry their own z-index (§A2).
 *
 * Footer sits OUTSIDE <main> so it maps to the contentinfo landmark (§A10);
 * both stay inside the smooth-scroll content so they scroll together.
 */
export default function Home() {
  return (
    <>
      {/* Preloader renders from app/layout.tsx, outside the smoother */}
      {/* tabIndex -1: RouteVeil moves focus here on route change (§A10) */}
      <main tabIndex={-1} className="relative overflow-x-clip bg-bg outline-none">
        {/* The hero name is the page's single <h1> (§A10) */}
        <Hero />
        <div className="relative z-(--z-flow)">
          <About />
          <Divider />
          <WorkList />
          <Disciplines />
          <ContactVisual />
        </div>
      </main>
      <div className="relative z-(--z-flow) overflow-x-clip">
        <Footer />
      </div>
    </>
  );
}
