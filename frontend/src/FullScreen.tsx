import { Fullscreen } from "lucide-react";

export function FullScreen() {
  return (
    <button
      className="cursor-pointer"
      onClick={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }}
    >
      <Fullscreen size={16} />
    </button>
  );
}
