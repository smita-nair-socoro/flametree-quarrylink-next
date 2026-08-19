import { createProxyHandlers } from "@/lib/api/proxy";

// Use non-NEXT_PUBLIC env var so it's available at runtime (not baked in at build time)
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || process.env.NEXT_PUBLIC_API_URL || "";
const ORCHESTRATOR_CONTEXT_PATH = "/socoro/quarrylink/api";

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers(
  ORCHESTRATOR_URL,
  ORCHESTRATOR_CONTEXT_PATH,
);
