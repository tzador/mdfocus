import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { type RootType } from "mdream-common/src/common";
import { NavLink } from "react-router";

export function Side() {
  const query = useQuery({
    queryKey: ["root"],
    queryFn: async () => {
      const response = await ky.get<RootType>("/api/root");
      return response.json();
    },
  });

  return (
    <div className="bg-stone-100 overflow-y-auto py-4 px-2 opacity-0 hover:opacity-100">
      {query.isPending && <div>Loading...</div>}

      {query.isError && <div>Error: {query.error.message}</div>}

      {query.isSuccess && (
        <div className="flex flex-col gap-2">
          <h1 className="text-md font-bold  text-stone-500">
            {query.data.root}
          </h1>
          <ul>
            {query.data.paths.map((path) => (
              <li key={path} className="text-md text-stone-500">
                <NavLink to={path}>{path}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
