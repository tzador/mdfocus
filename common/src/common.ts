import { z } from "zod";

export const RootSchema = z.object({
  root: z.string(),
  paths: z.string().array(),
});

export type RootType = z.infer<typeof RootSchema>;

export const FileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export type FileType = z.infer<typeof FileSchema>;
