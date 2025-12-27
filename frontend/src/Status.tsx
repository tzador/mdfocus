import { useEffect, useState } from "react";

const states = ["yellow", "green", "red", null] as const;

export function Status({ root, path }: { root: string; path: string }) {
  const key = `mdream-checkmark:${root}/${path}`;
  const [checked, setChecked] = useState<
    "red" | "yellow" | "green" | null | undefined
  >(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setChecked(stored as "red" | "yellow" | "green" | null);
  }, [key]);

  useEffect(() => {
    if (checked === undefined) return;

    if (checked) {
      localStorage.setItem(key, checked);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, checked]);

  const colorClass =
    checked === "red"
      ? "bg-red-300"
      : checked === "yellow"
      ? "bg-yellow-300"
      : checked === "green"
      ? "bg-green-300"
      : "bg-gray-300 opacity-30";

  return (
    <button
      onClick={() =>
        setChecked(
          states[(states.indexOf(checked ?? null) + 1) % states.length]
        )
      }
    >
      <div
        className={`w-4 h-4 rounded-full cursor-pointer ${colorClass}`}
      ></div>
    </button>
  );
}
