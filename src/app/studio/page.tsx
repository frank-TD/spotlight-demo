"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The AIGC Studio now lives at /discovery. Keep this legacy route as a redirect
// so old links/bookmarks still land in the right place.
export default function StudioPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/discovery");
  }, [router]);
  return null;
}
