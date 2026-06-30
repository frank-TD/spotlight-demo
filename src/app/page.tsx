import EditorialHome from "./home-editorial/EditorialHome";

// Spotlight homepage — the Black + Lime editorial design, promoted to the root
// route. The full layout lives in EditorialHome (shared with the other colour
// variants); `theme="lime"` selects the all-dark charcoal + pure-black stages
// with an electric lime accent. The previous black-and-gold homepage is
// archived at /home-spotlight. Page title/description come from the root layout.
export default function HomePage() {
  return <EditorialHome theme="lime" />;
}
