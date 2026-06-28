import type { Metadata } from "next";
import EditorialHome from "../home-editorial/EditorialHome";

// Colour-variant preview of the editorial homepage: the exact same layout and
// content, with the orange accent retinted to Fanvue's electric brand green.
// Reuses EditorialHome with the "fanvue" theme — no markup is duplicated.

export const metadata: Metadata = {
  title: "Spotlight — Editorial (Fanvue Green)",
  robots: { index: false, follow: false },
};

export default function EditorialFanvuePage() {
  return <EditorialHome theme="fanvue" />;
}
