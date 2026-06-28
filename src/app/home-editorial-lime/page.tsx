import type { Metadata } from "next";
import EditorialHome from "../home-editorial/EditorialHome";

// Colour-variant preview of the editorial homepage in the Black + Lime palette:
// an all-dark scheme (charcoal + pure-black stages) with an electric lime accent.
// Reuses EditorialHome with the "lime" theme — no markup is duplicated.

export const metadata: Metadata = {
  title: "Spotlight — Editorial (Black + Lime)",
  robots: { index: false, follow: false },
};

export default function EditorialLimePage() {
  return <EditorialHome theme="lime" />;
}
