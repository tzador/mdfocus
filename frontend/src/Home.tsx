import { type TreeType } from "mdfocus-common/src/common";
import { useEffect } from "react";
import { Tree } from "./Tree";
import { useScrollPosition } from "./useScrollPosition";

export function Home({ tree }: { tree: TreeType }) {
  useScrollPosition(tree.root, "/");
  useEffect(() => {
    const title = tree.root.split("/").pop() || "mdfocus";
    document.title = title;
  }, []);
  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto">
        <Tree tree={tree} />
      </div>
    </div>
  );
}
