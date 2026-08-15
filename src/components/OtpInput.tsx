"use client";

import { useEffect, useRef } from "react";

/**
 * A 6-digit OTP code input with 6 separate boxes.
 * - Auto-advances to next box on input
 * - Backspace goes to previous box
 * - Paste fills all boxes
 * - Calls onComplete when all 6 digits are filled
 */
export default function OtpInput({
  value,
  onChange,
  onComplete,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  onComplete?: (code: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first box on mount
    refs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, v: string) => {
    // Only accept digits
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);

    // Auto-advance
    if (digit && i < 5) {
      refs.current[i + 1]?.focus();
    }

    // Check completion
    if (next.every((d) => d !== "") && onComplete) {
      onComplete(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const chars = pasted.split("");
      const next = Array(6).fill("").map((_, i) => chars[i] || "");
      onChange(next);
      const lastFilled = Math.min(pasted.length - 1, 5);
      refs.current[lastFilled]?.focus();
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted);
      }
    }
  };

  return (
    <div className="flex justify-center gap-2.5" dir="ltr">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          data-cursor="text"
          className={`h-14 w-12 rounded-2xl border-2 bg-white text-center text-2xl font-black text-slate-900 outline-none transition dark:bg-slate-800 dark:text-slate-100 ${
            digit
              ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20"
              : "border-slate-200 focus:border-cyan-400 dark:border-slate-600"
          }`}
        />
      ))}
    </div>
  );
}
