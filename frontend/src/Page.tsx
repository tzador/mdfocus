import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ArrowLeft } from "lucide-react";
import type { FileType } from "mdfocus-common/src/common";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { FullScreen } from "./FullScreen";
import { GitHub } from "./GitHub";
import { Markdown } from "./Markdown";
import { Status } from "./Status";
import { TableOfContents } from "./TableOfContents";
import { Theme } from "./Theme";
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
    <div className="px-4">
      <div className="mx-auto max-w-4xl font-mono text-sm mb-8 flex gap-2 items-center h-7 sticky top-0 bg-(--mdfocus-bg)">
        <NavLink to="/">
          <ArrowLeft size={16} />
        </NavLink>
        <Status root={root} path={file.path} />
        <div className="flex-1 flex">
          <button
            className="max-w-full truncate text-start cursor-pointer"
            onClick={() => {
              window.scrollTo({ top: 0 });
            }}
          >
            {file.path}
          </button>
        </div>
        <GitHub />
        <Theme />
        <FullScreen />
      </div>
      <TableOfContents markdown={file.content} />
      <Markdown markdown={file.content} />
    </div>
  );
}
