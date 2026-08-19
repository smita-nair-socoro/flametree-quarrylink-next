import { createProxyHandlers } from "@/lib/api/proxy";

const TENANT_FUSION_URL = process.env.NEXT_PUBLIC_TENANT_FUSION_URL || "";
const TENANT_FUSION_CONTEXT_PATH = "/quarrylink/tenant-fusion/api";

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers(
  TENANT_FUSION_URL,
  TENANT_FUSION_CONTEXT_PATH,
);
