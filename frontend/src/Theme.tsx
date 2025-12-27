import { Palette } from "lucide-react";
import { useEffect } from "react";

const THEMES = ["light", "sepia", "dark", "oled"] as const;
const STORAGE_KEY = "mdfocus-theme";

function getStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.includes(stored as (typeof THEMES)[number])) {
    return stored as (typeof THEMES)[number];
  }
  return THEMES[0];
}

function setTheme(theme: (typeof THEMES)[number]) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function Theme() {
  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  return (
    <button
      className="cursor-pointer"
      onClick={() => {
        const current = document.documentElement.dataset.theme || THEMES[0];
        const currentIndex = THEMES.indexOf(current as (typeof THEMES)[number]);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        setTheme(THEMES[nextIndex]);
      }}
    >
      <Palette size={16} />
    </button>
  );
}
