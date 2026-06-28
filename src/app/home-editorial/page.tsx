import type { Metadata } from "next";
import EditorialHome from "./EditorialHome";

// Editorial homepage — Spotlight's full homepage in the "A United"
// Swiss/editorial language (charcoal + sand + orange, Montserrat, structural
// grid, axis ticks, corner notes, outlined titles, alternating ink/sand/orange
// stages). The body lives in EditorialHome so colour variants (see
// /home-editorial-fanvue) can reuse the exact same markup with a theme class.

export const metadata: Metadata = { title: "Spotlight — Editorial" };

export default function EditorialPage() {
  return <EditorialHome />;
}
