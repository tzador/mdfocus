import { type TreeType } from "mdream-common/src/common";
import { useEffect } from "react";
import { Tree } from "./Tree";

export function Home({ tree }: { tree: TreeType }) {
  useEffect(() => {
    const title = tree.root.split("/").pop() || "mdream";
    document.title = title;
  }, []);
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <Tree tree={tree} />
      </div>
    </div>
  );
}
