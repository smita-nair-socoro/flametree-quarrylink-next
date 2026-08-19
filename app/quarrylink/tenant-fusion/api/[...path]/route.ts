import { createProxyHandlers } from "@/lib/api/proxy";

// Use non-NEXT_PUBLIC env var so it's available at runtime (not baked in at build time)
const TENANT_FUSION_URL = process.env.TENANT_FUSION_URL || process.env.NEXT_PUBLIC_TENANT_FUSION_URL || "";
const TENANT_FUSION_CONTEXT_PATH = "/quarrylink/tenant-fusion/api";

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers(
  TENANT_FUSION_URL,
  TENANT_FUSION_CONTEXT_PATH,
);
