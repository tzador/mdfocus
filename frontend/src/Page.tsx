import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ArrowLeft } from "lucide-react";
import type { FileType } from "mdream-common/src/common";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { Markdown } from "./Markdown";
import { useScrollPosition } from "./useScrollPosition";

export function Page({ root, path }: { root: string; path: string }) {
  const query = useQuery({
    queryKey: ["file", path],
    queryFn: async () => {
      return await ky
        .get<FileType>(`/api/file/${path}`)
        .then((res) => res.json());
    },
    retry: false,
  });

  useEffect(() => {
    const originalTitle = document.title;
    const filename = path.split("/").pop() || path;
    document.title = filename;

    return () => {
      document.title = originalTitle;
    };
  }, [path]);

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

  return <LoadedPage root={root} file={query.data} />;
}

function LoadedPage({ root, file }: { root: string; file: FileType }) {
  useScrollPosition(root, file.path);

  return (
    <div className="p-4">
      <div className="mx-auto max-w-4xl text-blue-500 font-mono text-sm mb-8">
        <NavLink to="/" className="flex items-center gap-1">
          <ArrowLeft size={16} /> {file.path}
        </NavLink>
      </div>
      <Markdown markdown={file.content} />
    </div>
  );
}
