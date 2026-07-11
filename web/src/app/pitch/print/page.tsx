"use client";

import type { ComponentType } from "react";
import { SLIDES } from "@/components/pitch/slides";

/**
 * Print-only route: renders all 20 slides stacked, each as a 16:9 landscape
 * page. Use the browser's "Print → Save as PDF" (or headless Chrome) to export.
 * Page CSS lives in globals.css under the @media print block.
 */
export default function PitchPrintPage() {
  return (
    <div dir="ltr" className="pitch-print-root">
      {SLIDES.map((Slide, i) => {
        const S = Slide as ComponentType;
        return (
          <section key={i} className="pitch-print-page">
            <S />
          </section>
        );
      })}
    </div>
  );
}
