export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes — proxy handles its own auth)
     * - socoro (orchestrator proxy routes)
     * - quarrylink (tenant-fusion proxy routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - config.json (runtime config)
     */
    "/((?!api|socoro|quarrylink|_next/static|_next/image|favicon.ico|config.json).*)",
  ],
};
