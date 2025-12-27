import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { TreeType } from "mdream-common/src/common";
import { Route, Routes } from "react-router";
import { Home } from "./Home";
import { Page } from "./Page";
import { useWatch } from "./useWatch";

export function App() {
  useWatch();

  const query = useQuery({
    queryKey: ["root"],
    queryFn: async () => {
      return await ky.get<TreeType>("/api/root").then((res) => res.json());
    },
    retry: false,
  });

  if (query.isPending) {
    return null;
  }

  if (query.isError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-red-500">{query.error.message}</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home tree={query.data} />} />
      {query.data.paths.map((path) => (
        <Route
          key={path}
          path={path}
          element={<Page root={query.data.root} path={path} />}
        />
      ))}
      <Route
        path="*"
        element={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500">404 😭 Not Found</div>
          </div>
        }
      />
    </Routes>
  );
}
