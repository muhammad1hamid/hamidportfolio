"use client";

import { useEffect, useState } from "react";

export function CurrentYear({ initialYear }: { initialYear: number }) {
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    const refresh = () => setYear(new Date().getFullYear());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  return <>{year}</>;
}
