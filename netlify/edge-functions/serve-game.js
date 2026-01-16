import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  const url = new URL(request.url);
  const fileKey = url.searchParams.get("key"); // e.g. ?key=bios

  // --- SECURITY CHECK ---
  // 1. Check if the request is coming from your own site (Referer/Origin check)
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const allowedHost = "nsk-warrior-keen-fine-beta.netlify.app"; // REPLACE WITH YOUR ACTUAL DOMAIN

  // Allow localhost for testing, block others in production
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const isAllowed = (referer && referer.includes(allowedHost)) || (origin && origin.includes(allowedHost));

  if (!isLocal && !isAllowed) {
    return new Response("Forbidden: Hotlinking not allowed.", { status: 403 });
  }

  // --- FETCH & STREAM FILE ---
  if (!fileKey) return new Response("File not specified", { status: 400 });

  const store = getStore("game_assets");
  const blob = await store.get(fileKey, { type: "blob" });

  if (!blob) {
    return new Response("File not found", { status: 404 });
  }

  // Return the file stream with correct headers for EmulatorJS
  return new Response(blob, {
    headers: {
      "Content-Type": fileKey.endsWith(".zip") ? "application/zip" : "application/octet-stream",
      "Content-Length": blob.size,
      "Access-Control-Allow-Origin": "*", // CORS is safe because we checked Referer above
      "Cache-Control": "public, max-age=31536000, immutable" // Cache aggressively
    }
  });
};

export const config = { path: "/api/serve-game" };
