import type { Metadata } from "next";
import { Archivo_Black, Montserrat } from "next/font/google";
import styles from "./onyx.module.css";

// Homepage style draft #2 — Spotlight's homepage themes re-expressed in the
// "ONYX" brutalist brand-portfolio language (vivid red + charcoal + cream,
// Archivo Black display, grayscale-duotone imagery, a 2-column board of poster
// "page" panels). Self-contained route; does not touch the live homepage.
// Local /posters keep it offline-renderable.

export const metadata: Metadata = { title: "Spotlight — ONYX draft" };

const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--onyx-headline", display: "swap" });
const mont = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--onyx-body",
  display: "swap",
});

const img = (name: string) => ({ backgroundImage: `url(/posters/${name}.jpg)` });

export default function OnyxHome() {
  return (
    <main className={`${styles.root} ${archivo.variable} ${mont.variable}`}>
      <div className={styles.board}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className={`${styles.hero} ${styles.frame}`}>
          <div className={styles.heroRed}>
            <h1>Spotlight</h1>
            <p className={styles.heroSub}>
              AI Film
              <br />
              Marketplace
            </p>
            <div className={styles.heroContact}>
              <span>Fund · Own · Stream</span>
              <span>hello@spotlight.film</span>
            </div>
          </div>
          <div className={styles.heroPhoto}>
            <div className={styles.heroImg} style={img("aurora-crystal")} />
            <span className={styles.heroStrip} />
          </div>
          <p className={styles.heroTag}>
            Creator
            <br />
            Owned
          </p>
        </section>

        {/* ── About ────────────────────────────────────────────────────── */}
        <section className={`${styles.about} ${styles.frame}`}>
          <div className={styles.aboutCopy}>
            <h2 className={styles.bigHead}>
              Back
              <br />
              AI
              <br />
              Films
            </h2>
            <p>
              Spotlight is the marketplace where AI-powered films are created, funded, and
              distributed. Creators turn ideas into pitch-ready films; backers fund the stories they
              believe in — budgets held in escrow, released stage by stage.
            </p>
            <strong>
              Fund.
              <br />
              Own.
              <br />
              Stream.
            </strong>
          </div>
          <div className={styles.aboutMedia}>
            <div className={`${styles.duotone}`} style={img("golden-core")} />
            <div className={`${styles.duotone}`} style={img("neon-rain")} />
          </div>
        </section>

        {/* ── Creators (Team) ──────────────────────────────────────────── */}
        <section className={`${styles.team} ${styles.frame} ${styles.dark}`}>
          <div className={styles.teamIntro}>
            <h2 className={styles.bigHead}>
              The
              <br />
              Creators
            </h2>
            <p>Award-winning AIGC filmmakers — escrow-backed, verified, and ready to be commissioned.</p>
          </div>
          <p className={styles.eyebrow}>
            Made by
            <br />
            humans + AI
          </p>
          <div className={styles.teamGrid}>
            <figure>
              <div className={`${styles.person} ${styles.duotone}`} style={img("crimson-mirage")} />
              <figcaption>
                <b>Aria Song</b>Sci-Fi · Narrative
              </figcaption>
            </figure>
            <figure>
              <div className={`${styles.person} ${styles.duotone}`} style={img("the-eighth-day")} />
              <figcaption>
                <b>Marco Reyes</b>Brand · Commercial
              </figcaption>
            </figure>
            <figure>
              <div className={`${styles.person} ${styles.duotone}`} style={img("paper-lanterns")} />
              <figcaption>
                <b>Yuki Tanaka</b>Anime · Music Video
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── Story ────────────────────────────────────────────────────── */}
        <section className={`${styles.story} ${styles.frame} ${styles.dark}`}>
          <div className={styles.storyCopy}>
            <h2 className={styles.bigHead}>
              Spotlight
              <br />
              Story
            </h2>
            <p>
              Spotlight began with one belief: the next great films will be made by creators amplified
              by AI — and owned by the people who back them. From a single slate to a global
              marketplace, we fund the stories that matter.
            </p>
          </div>
          <div className={styles.mosaic}>
            <div className={styles.duotone} style={img("neon-rain")} />
            <div className={styles.duotone} style={img("golden-core")} />
            <div className={styles.duotone} style={img("paper-lanterns")} />
            <div className={styles.duotone} style={img("crimson-mirage")} />
          </div>
          <p className={styles.cornerNote}>
            Crafting
            <br />
            the slate
          </p>
          <p className={styles.passionNote}>
            Made here.
            <br />
            Seen everywhere
          </p>
        </section>

        {/* ── Studio ───────────────────────────────────────────────────── */}
        <section className={`${styles.studio} ${styles.frame}`}>
          <div className={styles.studioTitle}>
            <h2 className={styles.bigHead}>AIGC</h2>
            <p>
              The Spotlight Studio turns a prompt into a pitch — trailers, story packages, budgets and
              production assets, all in one place.
            </p>
          </div>
          <div className={styles.duotone} style={img("the-eighth-day")} />
          <div className={styles.studioCopy}>
            <p>
              From idea to screen: generate, iterate, and assemble a film with AI, then bring it to the
              marketplace to be backed and distributed worldwide.
            </p>
            <strong>
              Fueled by
              <br />
              creators
            </strong>
            <h2 className={styles.bigHead}>Studio</h2>
          </div>
        </section>

        {/* ── In the Spotlight (Inside) ────────────────────────────────── */}
        <section className={`${styles.inside} ${styles.frame} ${styles.dark}`}>
          <p className={styles.insideCopy}>
            Step into the slate. Released AI films, in production, and open to back — the work the
            network is making right now.
          </p>
          <div className={styles.insidePhotos}>
            <div className={`${styles.duotone}`} style={img("aurora-crystal")} />
            <div className={`${styles.duotone}`} style={img("neon-rain")} />
            <div className={`${styles.duotone}`} style={img("golden-core")} />
          </div>
          <h2 className={styles.bigHead}>
            In The
            <br />
            Spotlight
          </h2>
          <p className={styles.actionNote}>Now Showing</p>
        </section>

        {/* ── Ticker ───────────────────────────────────────────────────── */}
        <section className={`${styles.ticker} ${styles.frame}`}>
          <span>Create</span>
          <span>Fund</span>
          <span>Distribute</span>
          <span>Stream</span>
          <span>Own</span>
        </section>

        {/* ── Services ─────────────────────────────────────────────────── */}
        <section className={`${styles.services} ${styles.frame}`}>
          <div>
            <strong>Commission</strong>
          </div>
          <div>
            <strong>
              Fund &amp;
              <br />
              Distribute
            </strong>
          </div>
          <h2 className={styles.bigHead}>
            The
            <br />
            Pipeline
          </h2>
        </section>
      </div>
    </main>
  );
}
