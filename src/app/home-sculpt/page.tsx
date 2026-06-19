import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Film, Gem, Radio, Compass } from "lucide-react";
import styles from "./sculpt.module.css";

// Homepage style draft #3 — the live Spotlight homepage's own modules
// (hero / trust / featured / how-it-works / agents / distribution / creator
// callout / faq / contact), restyled in the "SCUL.PT" museum-editorial language
// (warm charcoal + bone + copper, Cormorant Garamond + Inter, grayscale duotone,
// hairline section titles, outline buttons, vertical rails). Same information,
// new skin. Self-contained route; does not touch the live homepage.

export const metadata: Metadata = { title: "Spotlight — SCUL.PT draft" };

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--sculpt-serif",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--sculpt-sans", display: "swap" });

const bg = (name: string) => ({ backgroundImage: `url(/posters/${name}.jpg)` });

export default function SculptHome() {
  return (
    <main className={`${styles.root} ${serif.variable} ${inter.variable}`}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero} style={bg("the-eighth-day")}>
        <header className={styles.header}>
          <span className={styles.logo}>
            <i />
            Spotlight
          </span>
          <nav className={styles.nav}>
            <Link href="/market">Marketplace</Link>
            <Link href="/discovery/workspace">AIGC Studio</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/market">Creators</Link>
            <Link href="/register">Sign in</Link>
          </nav>
        </header>

        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p className={styles.metaLine}>
              AI Film Marketplace <i />2026
            </p>
            <h1>
              Fund it. Own it.
              <br />
              Stream it.
            </h1>
            <Link href="/market" className={styles.outlineBtn}>
              Explore films
            </Link>
            <div className={styles.sliderMini}>
              <span className={styles.navWord}>Prev</span>
              <b>1/4</b>
              <span className={styles.navWord}>Next</span>
            </div>
          </div>

          <figure className={`${styles.heroArt} ${styles.photo}`} style={bg("aurora-crystal")} aria-label="Featured film" />
        </div>

        <aside className={styles.socialRail} aria-label="Social links">
          <i />
          <span>◎</span>
          <span>♥</span>
          <span>f</span>
          <span>⊙</span>
        </aside>
        <div className={styles.scrollDot} aria-hidden="true" />
      </section>

      {/* ── Trust ────────────────────────────────────────────────────────── */}
      <section className={styles.sectionPad}>
        <div className={styles.sectionTitle}>
          <small>trusted across the industry</small>
          <h2>Trusted</h2>
        </div>
        <div className={styles.stats}>
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

      {/* ── Featured ─────────────────────────────────────────────────────── */}
      <section className={styles.sectionPad}>
        <div className={styles.sectionTitle}>
          <small>now in the spotlight</small>
          <h2>Featured</h2>
        </div>
        <div className={styles.showcase}>
          <aside className={`${styles.sideEvent} ${styles.left}`} style={bg("neon-rain")}>
            <span>Open to back</span>
            <b>Neon Rain</b>
          </aside>

          <figure className={`${styles.eventImg} ${styles.photo}`} style={bg("aurora-crystal")} aria-label="Celestial Entity" />

          <article className={styles.eventCard}>
            <small>Now showing</small>
            <h3>
              Celestial Entity:
              <br />
              A deep-space salvage
            </h3>
            <p>
              A salvage crew finds something that has been waiting longer than the stars themselves —
              a sci-fi feature made with AI, seeking its backers.
            </p>
            <ul>
              <li>A film by Aria Song · Seoul</li>
              <li>Cinematic · Feature · 96 min</li>
              <li>Seeking a backer · ¥120K–480K</li>
            </ul>
            <Link href="/market" className={styles.outlineBtn}>
              Back this project
            </Link>
          </article>

          <aside className={`${styles.sideEvent} ${styles.right}`} style={bg("golden-core")}>
            <span>Released</span>
            <b>Golden Core</b>
          </aside>
        </div>
        <div className={styles.counter}>
          <span>←</span>
          <b>1/5</b>
          <span>→</span>
        </div>
      </section>

      {/* ── How it works (quick links) ───────────────────────────────────── */}
      <section className={styles.quickLinks}>
        <Link href="/how-it-works">
          <Film className={styles.quickIcon} size={44} strokeWidth={1.1} />
          Create
        </Link>
        <Link href="/how-it-works">
          <Gem className={styles.quickIcon} size={44} strokeWidth={1.1} />
          Fund
        </Link>
        <Link href="/how-it-works">
          <Radio className={styles.quickIcon} size={44} strokeWidth={1.1} />
          Distribute
        </Link>
        <Link href="/market">
          <Compass className={styles.quickIcon} size={44} strokeWidth={1.1} />
          Explore
        </Link>
      </section>

      {/* ── Agents ───────────────────────────────────────────────────────── */}
      <section className={styles.sectionPad}>
        <div className={styles.sectionTitle}>
          <small>agents negotiate, you approve</small>
          <h2>Deal agents</h2>
        </div>
        <div className={styles.agents}>
          <figure className={`${styles.agentImg} ${styles.photo}`} style={bg("crimson-mirage")} aria-label="Deal agents" />
          <div className={styles.agentCopy}>
            <h3>
              Agents align the terms.
              <br />
              You give the final yes.
            </h3>
            <p>
              Marlow represents backers, Wren represents creators. They settle budget, milestones,
              rights and escrow — then prepare a deal summary. The human always gives the final
              approval; the agents never close a deal on their own.
            </p>
            <div className={styles.agentRoles}>
              <div className={styles.agentRole}>
                <b>Marlow</b>
                <span>Backer&apos;s agent</span>
              </div>
              <div className={styles.agentRole}>
                <b>Wren</b>
                <span>Creator&apos;s agent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Distribution (blog grid) ─────────────────────────────────────── */}
      <section className={styles.sectionPad}>
        <div className={styles.sectionTitle}>
          <small>made here, seen everywhere</small>
          <h2>Distribution</h2>
        </div>
        <div className={styles.blogGrid}>
          <article className={styles.blogCard}>
            <figure className={`${styles.blogImg} ${styles.photo}`} style={bg("golden-core")} />
            <time>Released · May 2026</time>
            <h3>Aurora Crystal</h3>
            <p>
              An AI short released globally across streaming and festival channels, tracked from
              première to long tail. <b>MORE</b>
            </p>
          </article>
          <article className={styles.blogCard}>
            <figure className={`${styles.blogImg} ${styles.photo}`} style={bg("neon-rain")} />
            <time>Released · Apr 2026</time>
            <h3>Neon Requiem</h3>
            <p>
              From a backed brief to a worldwide release — distributed, measured, and paid out stage
              by stage through Spotlight. <b>MORE</b>
            </p>
          </article>
        </div>
      </section>

      {/* ── Creator callout ──────────────────────────────────────────────── */}
      <section className={styles.sectionPad}>
        <div className={styles.callout}>
          <h2>The AI film movement needs its next creators.</h2>
          <p>
            Start creating with AI, enter the Spotlight slate, and let backers carry your story from
            idea to screen.
          </p>
          <Link href="/market" className={styles.outlineBtn}>
            Join Spotlight
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={styles.sectionPad}>
        <div className={styles.sectionTitle}>
          <small>common questions</small>
          <h2>FAQ</h2>
        </div>
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
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section className={styles.contact}>
        <div className={styles.contactCard}>
          <div className={styles.contactCopy}>
            <h2>Stay in touch</h2>
            <p className={styles.phone}>+1 (415) 872 3578</p>
            <address className={styles.addr}>
              Spotlight Technologies
              <br />
              San Francisco
              <br />
              CA 94105
            </address>
            <a className={styles.mail} href="mailto:hello@spotlight.film">
              hello@spotlight.film
            </a>
            <div className={styles.socialRow}>
              <span>◎</span>
              <span>♥</span>
              <span>f</span>
              <span>⊙</span>
            </div>
            <form className={styles.form}>
              <div className={styles.inputRow}>
                <input type="email" aria-label="Email for newsletter" placeholder="Enter email for the slate" />
              </div>
              <button className={styles.outlineBtn} type="button">
                Subscribe
              </button>
            </form>
          </div>
          <div className={styles.contactArt} aria-hidden="true">
            <span className={styles.label}>
              Made here.
              <br />
              Seen everywhere.
            </span>
            <span className={styles.pin} />
          </div>
        </div>
        <footer className={styles.footer}>Spotlight Technologies © 2026 — Fund it. Own it. Stream it.</footer>
      </section>
    </main>
  );
}
