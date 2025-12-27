import { z } from "zod";

export const TreeSchema = z.object({
  root: z.string(),
  paths: z.string().array(),
});

export type TreeType = z.infer<typeof TreeSchema>;

export const FileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export type FileType = z.infer<typeof FileSchema>;
