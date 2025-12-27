import { type RootType } from "mdream-common/src/common";
import { NavLink } from "react-router";

export function Home({ root }: { root: RootType }) {
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
