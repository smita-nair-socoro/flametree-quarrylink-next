import { createProxyHandlers } from "@/lib/api/proxy";

const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ORCHESTRATOR_CONTEXT_PATH = "/socoro/quarrylink/api";

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers(
  ORCHESTRATOR_URL,
  ORCHESTRATOR_CONTEXT_PATH,
);
