import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { FileType } from "mdream-common/src/common";
import { useParams } from "react-router";
import { Markdown } from "./Markdown";

export function Page() {
  const params = useParams();
  const path = params["*"] || "";

  const query = useQuery({
    queryKey: ["file", path],
    queryFn: async () => {
      const response = await ky.get<FileType>(`/api/file/${path}`);
      return response.json();
    },
  });

  return (
    <div className="py-4 px-2 overflow-y-auto">
      {query.isPending && <div>Loading...</div>}
      {query.isError && <div>Error: {query.error.message}</div>}
      {query.isSuccess && <Markdown markdown={query.data.content} />}
    </div>
  );
}
