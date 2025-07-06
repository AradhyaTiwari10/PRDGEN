import React from "react";

export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#232e2b]/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#5A827E] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-lg font-semibold drop-shadow-lg">{text}</span>
      </div>
    </div>
  );
} 