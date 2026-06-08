import { redirect } from "next/navigation";

// The AIGC Studio workspace now lives at /discovery/workspace. Keep this
// legacy route as a redirect so old links/bookmarks still land in the right place.
export default function StudioPage() {
  redirect("/discovery/workspace");
}
