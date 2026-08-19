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
    username: claims.email as string | undefined,
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

  const headers: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": "application/json",
    "x-requested-with": "XMLHttpRequest",
    "X-Tenant-ID": tenantId,
    Authorization: `Bearer ${bearerToken}`,
  };

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    if (body) {
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
