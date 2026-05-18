"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function CounterAnimation({ target, duration = 2000, suffix = "", prefix = "", className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const numericTarget = parseInt(String(target).replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericTarget)) return;

    let start = 0;
    const step = numericTarget / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  const formatted = count.toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
