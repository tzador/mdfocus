import { GithubLogoIcon } from "@phosphor-icons/react";

export function GitHub() {
  return (
    <button
      className="cursor-pointer"
      onClick={() => {
        window.open("https://github.com/tzador/mdfocus", "_blank");
      }}
    >
      <GithubLogoIcon size={16} />
    </button>
  );
}
