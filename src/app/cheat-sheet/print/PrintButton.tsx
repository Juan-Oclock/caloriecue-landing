"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-5 py-2 bg-[#E05A3A] text-white text-sm font-semibold rounded-lg hover:bg-[#C74B2E] transition-colors"
    >
      Print / Save as PDF
    </button>
  );
}
