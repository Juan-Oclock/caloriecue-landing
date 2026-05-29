/**
 * Single source of truth for the homepage FAQ.
 *
 * Both the visible accordion (FAQSection.tsx) and the FAQPage JSON-LD
 * structured data (page.tsx) read from this list, so the two can never
 * drift apart — important because mismatched JSON-LD can hurt SEO.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How accurate is the AI calorie estimation?",
    answer:
      "Our AI recognizes foods and estimates their nutrition with high accuracy, and it keeps getting better. If a result ever looks off, just re-analyze the photo or adjust the portions in a tap. For packaged foods, our barcode scanner pulls exact nutrition data from verified databases.",
  },
  {
    question: "Is CalorieCue really free?",
    answer:
      "Yes! The free tier includes 3 meal scans per day plus 3 AI Coach messages per day. For unlimited scans and all features, CalorieCue Premium is $3.99/month (or $19.99/year) with a 7-day free trial.",
  },
  {
    question: "What types of food can CalorieCue recognize?",
    answer:
      "CalorieCue works with virtually any food — home-cooked meals, restaurant dishes, mixed plates, single items, and any cuisine from sushi to sinigang. You can also scan barcodes on packaged foods or log meals manually with natural language.",
  },
  {
    question: "How is this different from MyFitnessPal or Lose It?",
    answer:
      "CalorieCue is photo-first — just snap a picture instead of searching through endless food databases. Our AI Coach (Cue) provides personalized nutrition advice on demand, and the interface is designed for speed: log a meal in 3 seconds, not 30.",
  },
  {
    question: "Is calorie tracking effective for weight loss?",
    answer:
      "Yes, when done consistently. Meta-analyses show calorie tracking improves weight-loss outcomes, primarily by increasing awareness of what and how much you eat. The exact method matters less than consistency over time.",
  },
  {
    question: "Do I need to track every day?",
    answer:
      "No — but more days tracked usually means better results. Most people see good outcomes tracking 5–6 days per week. Weekly averages matter more than perfect daily logging.",
  },
  {
    question: "What if I eat out a lot?",
    answer:
      "CalorieCue's photo scanning works on restaurant meals too. For chains, the barcode scanner pulls verified data. Estimates may be less precise for unique restaurant dishes — that's normal for any tracker.",
  },
  {
    question: "How many calories should I eat to lose 1 lb per week?",
    answer:
      "Roughly 500 calories below your TDEE per day. Use the calculator above to find your number; it does the math for you.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely. We never sell your data or show ads. Apple Health data stays on your device. Your meal photos are processed securely and are not used to train AI models. Read our full privacy policy for details.",
  },
  {
    question: "Does CalorieCue work offline?",
    answer:
      "AI photo scanning and the AI Coach require an internet connection. However, manual food logging and viewing your diary history work offline — data syncs automatically when you’re back online.",
  },
  {
    question: "Is CalorieCue available on Android?",
    answer:
      "Not yet — we're focused on iOS first. Android is on the roadmap; check back for updates.",
  },
];

interface FaqPageJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

/**
 * Build the FAQPage structured-data object from FAQ_ITEMS so the markup
 * stays in lockstep with the rendered questions.
 */
export function buildFaqPageJsonLd(): FaqPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
