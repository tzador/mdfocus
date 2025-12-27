import { Github } from "lucide-react";

export function GitHub() {
  return (
    <button
      className="cursor-pointer"
      onClick={() => {
        window.open("https://github.com/tzador/mdfocus", "_blank");
      }}
    >
      <Github size={16} />
    </button>
  );
}
