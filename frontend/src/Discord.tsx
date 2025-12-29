import { DiscordLogoIcon } from "@phosphor-icons/react";

export function Discord() {
  return (
    <button
      className="cursor-pointer"
      onClick={() => {
        window.open("https://discord.gg/NkAcfA4vBT", "_blank");
      }}
    >
      <DiscordLogoIcon size={16} />
    </button>
  );
}
