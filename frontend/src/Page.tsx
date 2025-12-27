import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { FileType } from "mdream-common/src/common";
import { Markdown } from "./Markdown";

export function Page({ path }: { path: string }) {
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
      <Markdown markdown={query.data.content} />
    </div>
  );
}
