import { z } from "zod";

const snippet = z.string().max(200_000);

export const auditInputSchema = z.object({
  clientCode: snippet,
  serverCode: snippet,
  testCode: snippet,
  hostnames: z.string().max(20_000),
});

export type AuditInput = z.infer<typeof auditInputSchema>;
