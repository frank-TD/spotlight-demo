import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import styles from "./creatix.module.css";

// Homepage style draft #4 — the live Spotlight homepage's own modules
// (hero / trust / featured / how-it-works / agents / distribution / creator
// callout / faq / contact / footer), restyled in the "Creatix" playful-agency
// language (near-black + off-white + vivid lime, Space Grotesk + Inter, rounded
// white hero panel, glass stat pill, person cutouts, burst/doodle decor,
// numbered pill links, rotated ticker, green footer). Same information, new
// skin. Self-contained route; does not touch the live homepage.

export const metadata: Metadata = { title: "Spotlight — Creatix draft" };

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--creatix-font",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--creatix-sans",
  display: "swap",
});

const bg = (name: string) => ({ backgroundImage: `url(/posters/${name}.jpg)` });

export default function CreatixHome() {
  return (
    <main className={`${styles.root} ${display.variable} ${inter.variable}`}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={`${styles.hero} ${styles.sectionFull}`}>
        <div className={styles.heroPanel}>
          <header className={styles.navPill}>
            <Link href="/market">Marketplace</Link>
            <Link href="/discovery/workspace">AIGC Studio</Link>
            <Link className={styles.brand} href="/">
              <span className={styles.burst} />
              Spotlight
            </Link>
            <Link href="/market">Creators</Link>
            <Link href="/register">Sign in</Link>
          </header>

          <span className={styles.decorBurst} />
          <span className={styles.decorSwish} />

          <div className={styles.heroGrid}>
            <article className={styles.heroCopy}>
              <p>
                From first frame to final cut, Spotlight pairs AI filmmakers with backers who fund
                the work — escrow-protected, milestone by milestone.
              </p>
              <Link className={`${styles.button} ${styles.ghost}`} href="/market">
                Explore films
              </Link>
            </article>

            <div className={styles.heroCenter}>
              <h1>
                Fund it. Own it.
                <br />
                Stream it.
              </h1>
              <figure
                className={`${styles.personCutout} ${styles.heroPerson}`}
                style={bg("aurora-crystal")}
                aria-label="Featured AI film still"
              />
              <div className={styles.dualCta}>
                <Link className={`${styles.button} ${styles.green}`} href="/discovery/workspace">
                  Start a project
                </Link>
                <Link className={`${styles.button} ${styles.glass}`} href="/market">
                  Back a film
                </Link>
              </div>
            </div>

            <aside className={styles.experience}>
              <div className={styles.stars}>★★★★★</div>
              <strong>98%</strong>
              <span>Completion</span>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────────── */}
      <section className={`${styles.stats} ${styles.sectionFull}`}>
        <div className={styles.statsPill}>
          <article>
            <strong>
              2,400<em>+</em>
            </strong>
            <small>Creators</small>
          </article>
          <article>
            <strong>
              ¥18M<em>+</em>
            </strong>
            <small>Commissioned</small>
          </article>
          <article>
            <strong>
              98<em>%</em>
            </strong>
            <small>Completion</small>
          </article>
          <article>
            <strong>
              100<em>%</em>
            </strong>
            <small>Escrow protected</small>
          </article>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────────── */}
      <section className={`${styles.masterpieces} ${styles.sectionFull}`}>
        <div className={`${styles.splitCopy} ${styles.sectionInner}`}>
          <h2 className={styles.head2}>
            Now in the
            <br />
            Spotlight
          </h2>
          <p>
            Celestial Entity — a deep-space salvage feature made with AI — is open to back right now.
            A salvage crew finds something that has been waiting longer than the stars themselves, and
            it&apos;s looking for the backers who&apos;ll carry it to screen.
          </p>
        </div>

        <div className={`${styles.projectGrid} ${styles.sectionInner}`}>
          <article
            className={`${styles.projectLarge} ${styles.imageCard}`}
            style={bg("the-eighth-day")}
          >
            <span className={styles.spark} />
            <div className={styles.limeCaption}>
              Celestial Entity
              <br />
              Open to back
            </div>
          </article>
          <article
            className={`${styles.projectTall} ${styles.imageCard}`}
            style={bg("neon-rain")}
          >
            <span className={styles.doodle} />
          </article>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className={`${styles.services} ${styles.sectionFull}`}>
        <div className={`${styles.servicePanel} ${styles.sectionInner}`}>
          <span className={styles.verticalTab}>How it works</span>
          <div className={styles.serviceList}>
            <h2 className={styles.head2}>
              The <span className={styles.markGreen}>Process</span>
            </h2>
            <p>
              Four steps from idea to screen — every stage protected by escrow and approved by you.
            </p>
            <Link href="/discovery/workspace">
              <b>01</b> Create with AI <span>→</span>
            </Link>
            <Link href="/market">
              <b>02</b> Fund via escrow <span>→</span>
            </Link>
            <Link href="/how-it-works">
              <b>03</b> Approve milestones <span>→</span>
            </Link>
            <Link href="/how-it-works">
              <b>04</b> Distribute &amp; stream <span>→</span>
            </Link>
          </div>

          <figure
            className={`${styles.servicePhoto} ${styles.imageCard}`}
            style={bg("crimson-mirage")}
            aria-label="A film in production"
          />

          <aside className={styles.serviceSide}>
            <article className={styles.darkTile}>
              <p>Ever wondered how a film actually gets funded?</p>
              <strong>
                See how
                <br />
                it works
              </strong>
              <i>↗</i>
            </article>
            <article className={styles.greenTile}>
              <p>Looking for a creator to bring your script to life?</p>
              <strong>
                Meet the
                <br />
                creators
              </strong>
              <i>↗</i>
            </article>
          </aside>
        </div>
      </section>

      {/* ── Agents ───────────────────────────────────────────────────────── */}
      <section className={`${styles.agents} ${styles.sectionFull}`}>
        <div className={`${styles.agentsGrid} ${styles.sectionInner}`}>
          <div>
            <h2 className={styles.head2}>
              Agents negotiate.
              <br />
              You <span className={styles.markGreen}>approve</span>.
            </h2>
            <p>
              Marlow represents backers, Wren represents creators. They settle budget, milestones,
              rights and escrow — then prepare a deal summary. The human always gives the final yes;
              the agents never close a deal on their own.
            </p>
          </div>
          <div className={styles.agentTiles}>
            <article className={styles.darkTile}>
              <p>Represents backers — argues budget, milestones and rights on your behalf.</p>
              <strong>
                Marlow
                <br />
                Backer&apos;s agent
              </strong>
              <i>↗</i>
            </article>
            <article className={styles.greenTile}>
              <p>Represents creators — protects scope, timeline and payout for the maker.</p>
              <strong>
                Wren
                <br />
                Creator&apos;s agent
              </strong>
              <i>↗</i>
            </article>
          </div>
        </div>
      </section>

      {/* ── Distribution ─────────────────────────────────────────────────── */}
      <section className={`${styles.distribution} ${styles.sectionFull}`}>
        <div className={styles.sectionInner}>
          <div className={styles.manifesto}>
            <h2>
              Made here <em>+</em> Seen <em>+</em> Everywhere
            </h2>
            <div className={styles.lineRule}>
              <i />
            </div>
          </div>
          <div className={styles.releaseGrid}>
            <figure className={styles.imageCard} style={bg("golden-core")} aria-label="Aurora Crystal — released" />
            <figure className={styles.imageCard} style={bg("paper-lanterns")} aria-label="Neon Requiem — released" />
          </div>
        </div>
      </section>

      {/* ── Creator callout ──────────────────────────────────────────────── */}
      <section className={`${styles.callout} ${styles.sectionFull}`}>
        <div className={`${styles.calloutPanel} ${styles.sectionInner}`}>
          <h2>
            The AI film movement
            <br />
            needs its next creators.
          </h2>
          <p>
            Start creating with AI, enter the Spotlight slate, and let backers carry your story from
            idea to screen.
          </p>
          <Link className={styles.button} href="/discovery/workspace">
            Join Spotlight
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={`${styles.faq} ${styles.sectionFull}`}>
        <div className={`${styles.sectionInner}`}>
          <h2 className={styles.head2} style={{ textAlign: "center" }}>
            Frequently <span className={styles.markGreen}>asked</span>
          </h2>
          <div className={styles.faqList}>
            <div className={styles.faqRow}>
              <h3>How does funding work?</h3>
              <p>
                Backers fund a project&apos;s budget into escrow. Funds release to the creator stage by
                stage, only on the backer&apos;s approval at each milestone.
              </p>
            </div>
            <div className={styles.faqRow}>
              <h3>Who owns the finished film?</h3>
              <p>
                Ownership terms are set in the deal and held on the platform — backers own a stake in
                the films they fund, with rights spelled out up front.
              </p>
            </div>
            <div className={styles.faqRow}>
              <h3>How are creators vetted?</h3>
              <p>
                Creators are verified, rated, and escrow-backed; their completion and punctuality
                records are visible before you commission them.
              </p>
            </div>
            <div className={styles.faqRow}>
              <h3>What does escrow protect?</h3>
              <p>
                Your budget stays locked and is released only when you approve each stage — the
                platform mediates disputes if they arise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────────────────── */}
      <section className={`${styles.ticker} ${styles.sectionFull}`} aria-label="Spotlight lifecycle">
        <div>
          Create <em>+</em> Fund <em>+</em> Distribute <em>+</em> Stream <em>+</em> Own
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section className={`${styles.contact} ${styles.sectionFull}`}>
        <div className={`${styles.contactInner} ${styles.sectionInner}`}>
          <div>
            <h2>Get in touch today</h2>
            <p>
              Whether you&apos;re backing your first film or pitching your next one, tell us where to
              reach you and the Spotlight team will follow up.
            </p>
            <form className={styles.contactForm}>
              <input type="email" aria-label="Email address" placeholder="Enter your email" />
              <button type="button">Contact us</button>
            </form>
          </div>
          <figure
            className={`${styles.contactPerson} ${styles.personCutout}`}
            style={bg("golden-core")}
            aria-label="A Spotlight creator"
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className={`${styles.footer} ${styles.sectionFull}`}>
        <div className={`${styles.footerInner} ${styles.sectionInner}`}>
          <div>
            <h2>Spotlight</h2>
            <p>
              A marketplace for AI film — fund it, own it, stream it. Built for the creators and
              backers of the next slate.
            </p>
          </div>
          <nav>
            <Link href="/market">Marketplace</Link>
            <Link href="/discovery/workspace">AIGC Studio</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/market">Creators</Link>
            <Link href="/register">Sign in</Link>
            <Link href="/">About</Link>
          </nav>
          <form className={styles.footerForm}>
            <input type="email" aria-label="Newsletter email" placeholder="Enter your email" />
            <button type="button">Subscribe</button>
          </form>
        </div>
      </footer>
    </main>
  );
}
