import type { Metadata } from "next";
import { Inter } from "next/font/google";
import styles from "./previews.module.css";

// Temporary internal gallery — one place to open and compare every homepage
// style draft. The drafts live at their own routes (/, /home-editorial,
// /home-onyx, /home-sculpt, /home-creatix); this page just links out to them
// with screenshot thumbnails. Not linked from the production nav.

export const metadata: Metadata = {
  title: "Spotlight — Homepage drafts",
  robots: { index: false, follow: false },
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--previews-font",
  display: "swap",
});

type Draft = {
  name: string;
  route: string;
  thumb: string;
  accent: string;
  desc: string;
  live?: boolean;
};

const DRAFTS: Draft[] = [
  {
    name: "Spotlight",
    route: "/",
    thumb: "/previews/home-editorial-lime.jpg",
    accent: "#c6ff34",
    desc: "The live homepage — Black + Lime editorial: all-dark charcoal + pure-black stages with an electric lime accent.",
    live: true,
  },
  {
    name: "Spotlight — Cinematic (archived)",
    route: "/home-spotlight",
    thumb: "/previews/home-live.jpg",
    accent: "#d4af37",
    desc: "The previous homepage — black-and-gold cinematic, Cormorant serif, WebGL aurora hero. Archived after the Black + Lime promotion.",
  },
  {
    name: "Editorial — A United",
    route: "/home-editorial",
    thumb: "/previews/home-editorial.jpg",
    accent: "#f25a05",
    desc: "Swiss editorial: charcoal, sand & orange, Montserrat, structural grid, outlined watermark titles.",
  },
  {
    name: "Editorial — Fanvue Green",
    route: "/home-editorial-fanvue",
    thumb: "/previews/home-editorial-fanvue.jpg",
    accent: "#1fe96b",
    desc: "The editorial layout retinted to Fanvue's fluorescent brand green — same Swiss grid, orange swapped for vivid neon green.",
  },
  {
    name: "ONYX",
    route: "/home-onyx",
    thumb: "/previews/home-onyx.jpg",
    accent: "#ff2d2f",
    desc: "Brutalist brand-portfolio: vivid red, charcoal & cream, Archivo Black, grayscale-duotone imagery.",
  },
  {
    name: "SCUL.PT",
    route: "/home-sculpt",
    thumb: "/previews/home-sculpt.jpg",
    accent: "#b87962",
    desc: "Museum-editorial: warm charcoal, bone & copper, Cormorant Garamond, hairline-flanked titles.",
  },
  {
    name: "Creatix",
    route: "/home-creatix",
    thumb: "/previews/home-creatix.jpg",
    accent: "#8aff3d",
    desc: "Playful agency: vivid lime, near-black & off-white, Space Grotesk, rounded panels and person cutouts.",
  },
];

export default function PreviewsGallery() {
  return (
    <main className={`${styles.root} ${inter.variable}`}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>Internal preview</span>
        <h1>Homepage style drafts</h1>
        <p>
          Four alternative homepage directions alongside the live site, each restyling the same
          Spotlight content in a different visual language. Open any of them to compare — they&apos;re
          drafts for picking a direction, not production pages.
        </p>
      </header>

      <div className={styles.grid}>
        {DRAFTS.map((d) => (
          <a
            key={d.route}
            className={styles.card}
            href={d.route}
            target="_blank"
            rel="noopener noreferrer"
            style={{ "--accent": d.accent } as React.CSSProperties}
          >
            <figure
              className={styles.thumb}
              style={{ backgroundImage: `url(${d.thumb})` }}
              aria-label={`${d.name} homepage preview`}
            >
              {d.live ? <span className={styles.badge}>Live</span> : null}
              <span className={styles.open} aria-hidden="true">
                ↗
              </span>
            </figure>
            <div className={styles.meta}>
              <div className={styles.row}>
                <h2 className={styles.name}>
                  <span className={styles.swatch} />
                  {d.name}
                </h2>
                <span className={styles.routeTag}>{d.route}</span>
              </div>
              <p className={styles.desc}>{d.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <p className={styles.note}>
        Temporary entry · open at <code>/previews</code> · not linked from the main navigation.
      </p>
    </main>
  );
}
