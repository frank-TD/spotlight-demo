// Resolve media (video/image) paths against an optional CDN base so hosting can
// move off Next.js `/public` without touching any component. Set
// NEXT_PUBLIC_VIDEO_CDN (e.g. https://cdn.spotlight.app) and a local path like
// "/videos/hero/clip.mp4" resolves to "<cdn>/videos/hero/clip.mp4". When unset,
// the local /public path is used. Absolute (http/https) and inline (data/blob)
// URLs are returned untouched, so an API that already returns full URLs works
// as-is. NEXT_PUBLIC_ vars are inlined at build, so this is safe in client and
// server components alike.
const CDN_BASE = (process.env.NEXT_PUBLIC_VIDEO_CDN ?? "").replace(/\/+$/, "");

export function mediaUrl(path: string): string {
  if (/^(?:https?:|data:|blob:)/.test(path)) return path;
  if (!CDN_BASE) return path;
  return `${CDN_BASE}/${path.replace(/^\/+/, "")}`;
}
