import type { Metadata } from "next";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import styles from "./editorial.module.css";

// Editorial homepage variant — Spotlight's homepage themes re-expressed in the
// "A United" Swiss/editorial language (charcoal + sand + orange, Montserrat,
// structural grid, ticks, corner notes, outlined titles, dark screen mockups
// with orange info panels). Self-contained route; does not touch the live
// black-gold homepage. Local /posters keep it offline-renderable.

export const metadata: Metadata = { title: "Spotlight — Editorial" };

const mont = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

const GENRES = ["Sci-Fi", "Drama", "Anime", "Documentary", "Music", "Action", "Fantasy"];

function Mark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 92" aria-hidden="true">
      <path d="M50 0 100 82H72L50 40 28 82H0L50 0Z" />
    </svg>
  );
}

export default function EditorialHome() {
  return (
    <main className={`${styles.root} ${mont.className}`}>
      {/* ── Brand stage (hero) ───────────────────────────────────────────── */}
      <section className={`${styles.brandStage} ${styles.gridStage}`}>
        <span className={styles.topRule} />
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisMid}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />

        <div className={`${styles.cornerNote} ${styles.noteLeftTop}`}>
          <i />AI film
          <br />
          marketplace
        </div>
        <div className={`${styles.cornerNote} ${styles.noteRightTop}`}>
          Fund · Own
          <br />
          Stream<i />
        </div>
        <div className={`${styles.cornerNote} ${styles.noteLeftBottom}`}>
          <i />2026
        </div>
        <div className={`${styles.cornerNote} ${styles.noteRightBottom}`}>
          For creators
          <br />& backers<i />
        </div>

        <div className={styles.brandLockup}>
          <Mark className={styles.brandMark} />
          <div className={styles.brandName}>Spotlight</div>
          <div className={styles.brandTag}>The AI film slate</div>
        </div>
      </section>

      {/* ── Trust meta band ──────────────────────────────────────────────── */}
      <section className={`${styles.trust} ${styles.gridStage}`}>
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />
        <div className={styles.trustRow}>
          <div className={styles.stat}>
            <b>2,400+</b>
            <span>Creators</span>
          </div>
          <div className={styles.stat}>
            <b>¥18M+</b>
            <span>Commissioned</span>
          </div>
          <div className={styles.stat}>
            <b>98%</b>
            <span>Completion</span>
          </div>
          <div className={styles.stat}>
            <b>Escrow</b>
            <span>Protected</span>
          </div>
        </div>
      </section>

      {/* ── Featured — the signature screen mockup ───────────────────────── */}
      <section className={styles.paperStage}>
        <span className={styles.giantMark} aria-hidden="true" />
        <span className={`${styles.outlineTitle} ${styles.paperOutline}`} aria-hidden="true">
          Featured
        </span>
        <div className={styles.kicker}>
          <i />
          <span className={styles.kickerDark}>In the Spotlight</span>
        </div>

        <article className={styles.browserMockup}>
          <div className={styles.screen}>
            <div
              className={styles.mockMain}
              style={{ backgroundImage: "url(/posters/aurora-crystal.jpg)" }}
            >
              <header className={styles.topNav}>
                <Mark className={styles.miniMark} />
                <nav>
                  <span className={styles.navLink}>About</span>
                  <span className={styles.navLink}>Films</span>
                  <span className={styles.navLink}>How it works</span>
                  <span className={styles.navLink}>Contact</span>
                </nav>
                <span className={styles.enBtn}>En +</span>
              </header>

              <aside className={styles.sideRail}>
                <span className={styles.rule} />
                <b className={styles.hash}>#</b>
                <ul>
                  {GENRES.map((g) => (
                    <li key={g} className={g === "Sci-Fi" ? styles.active : undefined}>
                      {g}
                    </li>
                  ))}
                </ul>
                <small className={styles.share}>Share</small>
              </aside>

              <div className={styles.screenCopy}>
                <h1>
                  Celestial
                  <br />
                  Entity
                </h1>
                <p className={styles.loc}>
                  A film by Aria Song,
                  <br />
                  Seoul
                </p>
                <h2 className={styles.next}>Neon Rain</h2>
                <small className={styles.nextLabel}>Next film</small>
              </div>

              <span className={`${styles.ghostBtn}`}>‹</span>
              <span className={`${styles.orangeBtn}`}>›</span>
            </div>

            <aside className={styles.infoPanel}>
              <div
                className={styles.infoPhoto}
                style={{ backgroundImage: "url(/posters/golden-core.jpg)" }}
              />
              <div className={styles.infoCopy}>
                <div className={styles.meta}>
                  <span>01.</span>
                  <span>2026</span>
                </div>
                <h3>
                  Sci-Fi feature
                  <br />
                  Seeking a backer
                  <br />
                  ¥120K–480K
                </h3>
                <Link href="/market" className={styles.readMore}>
                  Back this project
                </Link>
                <div className={styles.panelArrows}>
                  <span>‹</span>
                  <span>›</span>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </section>

      {/* ── Films mini-strip ─────────────────────────────────────────────── */}
      <section className={`${styles.carousel} ${styles.gridStage}`}>
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisMid}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />
        <span className={`${styles.tick} ${styles.tickLeft}`} />
        <span className={`${styles.tick} ${styles.tickRight}`} />

        <div className={styles.miniStrip}>
          <article className={styles.miniCard} style={{ backgroundImage: "url(/posters/neon-rain.jpg)" }}>
            <div className={styles.miniText}>
              <b>
                Neon
                <br />
                Rain
              </b>
              <span>Golden Core</span>
            </div>
            <aside>
              <small>
                By Marco Reyes,
                <br />
                Brand Film
              </small>
            </aside>
          </article>
          <article className={styles.miniCard} style={{ backgroundImage: "url(/posters/golden-core.jpg)" }}>
            <div className={styles.miniText}>
              <b>
                Golden
                <br />
                Core
              </b>
              <span>Paper Lanterns</span>
            </div>
            <aside>
              <small>
                By Sofia Okonkwo,
                <br />
                Documentary
              </small>
            </aside>
          </article>
          <article className={styles.miniCard} style={{ backgroundImage: "url(/posters/paper-lanterns.jpg)" }}>
            <div className={styles.miniText}>
              <b>
                Paper
                <br />
                Lanterns
              </b>
              <span>Celestial Entity</span>
            </div>
            <aside>
              <small>
                By Yuki Tanaka,
                <br />
                AI Short Film
              </small>
            </aside>
          </article>
        </div>
      </section>

      {/* ── Create · Fund · Distribute (numbered editorial steps) ────────── */}
      <section className={styles.stepsStage}>
        <span className={`${styles.outlineTitle} ${styles.paperOutline}`} aria-hidden="true">
          Pipeline
        </span>
        <div className={styles.kicker}>
          <i />
          <span className={styles.kickerDark}>Create · Fund · Distribute</span>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <span className={styles.num}>01</span>
            <span className={styles.bar} />
            <h4>Create</h4>
            <p>Turn ideas into pitch-ready AI films — trailers, story packages, budgets and production assets.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.num}>02</span>
            <span className={styles.bar} />
            <h4>Fund</h4>
            <p>Back the stories you believe in. Budgets stay in escrow, released stage by stage on your approval.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.num}>03</span>
            <span className={styles.bar} />
            <h4>Distribute</h4>
            <p>Release finished films across channels, track performance, and reach audiences worldwide.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <section className={`${styles.footer} ${styles.gridStage}`}>
        <span className={styles.topRule} />
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />
        <div className={styles.footerInner}>
          <div className={styles.footerWord}>Spotlight</div>
          <Link href="/market" className={styles.footerCta}>
            Join Spotlight →
          </Link>
        </div>
        <div className={styles.footerMeta}>
          <span>© 2026 Spotlight Technologies</span>
          <span>Fund · Own · Stream</span>
          <span>UX / UI · 2026</span>
        </div>
      </section>
    </main>
  );
}
