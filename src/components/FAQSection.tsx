"use client";

import { useState } from "react";
import FadeInCSS from "@/components/FadeInCSS";
import { FAQ_ITEMS } from "@/lib/faq-data";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col gap-9">
        <FadeInCSS className="flex flex-col gap-3.5">
          <span className="eyebrow">FAQ</span>
          <h2 className="text-display text-foreground">Fair questions.</h2>
        </FadeInCSS>

        <FadeInCSS delay={0.05} className="flex flex-col border-t border-border">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question} className="border-b border-border">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-foreground transition-colors hover:text-primary-dark"
                  >
                    <span>{item.question}</span>
                    <span
                      className={`relative flex h-6 w-6 shrink-0 items-center justify-center text-primary-dark transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-5 pr-10"
                >
                  <p className="text-[15px] leading-[1.6] text-muted-foreground text-pretty">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </FadeInCSS>
      </div>
    </section>
  );
}
