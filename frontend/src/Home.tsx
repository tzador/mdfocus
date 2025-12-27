import { type TreeType } from "mdream-common/src/common";
import { useEffect } from "react";
import { NavLink } from "react-router";

export function Home({ root }: { root: TreeType }) {
  useEffect(() => {
    const title = root.root.split("/").pop() || "mdream";
    document.title = title;
  }, []);
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {root.paths.map((path) => (
          <div key={path}>
            <NavLink to={path} className="text-blue-500">
              {path}
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
}
