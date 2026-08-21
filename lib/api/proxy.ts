import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "tenant-001";

async function getTenantIdForUser(sub: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { sub },
      select: { tenantId: true },
    });
    return user?.tenantId || DEFAULT_TENANT_ID;
  } catch {
    return DEFAULT_TENANT_ID;
  }
}

/**
 * Creates a signed JWT (HS256) from the NextAuth session token claims.
 * The orchestrator validates this JWT with the shared AUTH_SECRET.
 */
async function createBearerToken(
  token: Awaited<ReturnType<typeof getToken>>,
): Promise<string | null> {
  if (!token?.sub) return null;

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  const claims = token as Record<string, unknown>;

  return new SignJWT({
    sub: claims.sub as string,
    username: claims.sub as string | undefined,
    email: claims.email as string | undefined,
    name: typeof claims.name === "string" ? claims.name : undefined,
    role: (claims.role as string | undefined)?.toLowerCase(),
    fullName: claims.fullName as string | undefined,
    tenantId: claims.tenantId as string | undefined,
    groups: (claims.groups as string[] | undefined)?.map((g) =>
      g.toLowerCase(),
    ),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

/**
 * Public endpoint patterns that bypass authentication.
 * These endpoints are called by unauthenticated users (e.g. customers
 * viewing a quote via a public link). The backend resolves the tenant
 * from the token parameter, so no X-Tenant-ID or Authorization header
 * is needed.
 */
const PUBLIC_ENDPOINT_PATTERNS = [
  /^quote\/public\//,
];

function isPublicEndpoint(pathString: string): boolean {
  return PUBLIC_ENDPOINT_PATTERNS.some((pattern) => pattern.test(pathString));
}

export async function proxyRequest(
  req: NextRequest,
  pathSegments: string[],
  upstreamBaseUrl: string,
  pathPrefix: string,
): Promise<NextResponse> {
  const pathString = pathSegments.join("/");
  const searchParams = req.nextUrl.search;

  // Build the target URL: upstreamBaseUrl + pathPrefix + path + searchParams
  const targetUrl = `${upstreamBaseUrl}${pathPrefix}/${pathString}${searchParams}`;

  // Public endpoints (e.g. quote/public/link) bypass authentication.
  // The backend resolves the tenant from the token parameter.
  if (isPublicEndpoint(pathString)) {
    const incomingContentType = req.headers.get("content-type") || "";
    const publicHeaders: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": incomingContentType || "application/json",
    };

    const publicInit: RequestInit = {
      method: req.method,
      headers: publicHeaders,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.arrayBuffer();
      if (body.byteLength > 0) {
        publicInit.body = body;
      }
    }

    try {
      const response = await fetch(targetUrl, publicInit);
      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const blob = await response.blob();
        return new NextResponse(blob, {
          status: response.status,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition":
              response.headers.get("content-disposition") || "",
          },
        });
      }

      const data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Proxy error (public):", error);
      return NextResponse.json(
        { error: "Failed to reach upstream service" },
        { status: 502 },
      );
    }
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: "__Secure-authjs.session-token",
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await getTenantIdForUser(token.sub);
  const bearerToken = await createBearerToken(token);

  if (!bearerToken) {
    return NextResponse.json(
      { error: "Failed to create auth token" },
      { status: 401 },
    );
  }

  const incomingContentType = req.headers.get("content-type") || "";
  const headers: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": incomingContentType || "application/json",
    "x-requested-with": "XMLHttpRequest",
    "X-Tenant-ID": tenantId,
    Authorization: `Bearer ${bearerToken}`,
  };

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.arrayBuffer();
    if (body.byteLength > 0) {
      init.body = body;
    }
  }

  try {
    const response = await fetch(targetUrl, init);
    const contentType = response.headers.get("content-type") || "";

    // Pass through non-JSON responses (images, files, etc.)
    if (!contentType.includes("application/json")) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition":
            response.headers.get("content-disposition") || "",
        },
      });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to reach upstream service" },
      { status: 502 },
    );
  }
}

export function createProxyHandlers(
  upstreamBaseUrl: string,
  pathPrefix: string,
) {
  async function handler(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
  ) {
    const { path } = await params;
    return proxyRequest(req, path, upstreamBaseUrl, pathPrefix);
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}
