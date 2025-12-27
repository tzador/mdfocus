import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ArrowLeft } from "lucide-react";
import type { FileType } from "mdream-common/src/common";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { Markdown } from "./Markdown";

export function Page({ path }: { path: string }) {
  // Extract filename from path and update document title
  useEffect(() => {
    const originalTitle = document.title;
    const filename = path.split("/").pop() || path;
    document.title = filename;

    // Reset title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [path]);

  const query = useQuery({
    queryKey: ["file", path],
    queryFn: async () => {
      return await ky
        .get<FileType>(`/api/file/${path}`)
        .then((res) => res.json());
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
    <div className="p-4">
      <div className="mx-auto max-w-4xl text-blue-500 font-mono text-sm mb-8">
        <NavLink to="/" className="flex items-center gap-1">
          <ArrowLeft size={16} /> {query.data.path}
        </NavLink>
      </div>
      <Markdown markdown={query.data.content} />
    </div>
  );
}
