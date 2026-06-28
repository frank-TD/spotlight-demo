import Link from "next/link";
import { Montserrat } from "next/font/google";
import EditorialDistribution from "./EditorialDistribution";
import EditorialHeroVideo from "./EditorialHeroVideo";
import EditorialSpotlight from "./EditorialSpotlight";
import { GlowDealCard, DrawLine, FaqAccordion } from "./motion";
import styles from "./editorial.module.css";
import StatCountUp from "@/components/home/StatCountUp";
import ScrollReveal from "@/components/home/ScrollReveal";

// The editorial homepage body, shared by every colour variant. The whole
// palette is scoped under `.root` and the accent is driven by two CSS vars
// (--orange / --orange-deep), so a variant only needs to add a theme class
// that overrides them — the markup is identical. `theme` selects that class:
// "orange" is the original; "fanvue" retints to the brand green; "lime" is the
// all-dark Black + Lime palette.

const mont = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

const bg = (name: string) => ({ backgroundImage: `url(/posters/${name}.jpg)` });

const GENRES = ["Sci-Fi", "Drama", "Anime", "Documentary", "Music", "Action", "Fantasy"];

const FAQ_ITEMS = [
  {
    q: "Is this like Fiverr or Upwork?",
    a: "No. Spotlight is a content commissioning platform, not a task marketplace. You commission full productions — brief to broadcast-ready — with IP protection and AI-managed delivery. Think executive producer, not task manager.",
  },
  {
    q: "What does a Patron do?",
    a: "You fund and direct content. Post your creative brief, set your budget, and own the final work. Marlow, your AI agent, handles negotiation, scoping, and brief production. You review and approve.",
  },
  {
    q: "How do Marlow and Wren work?",
    a: "Marlow is your AI Patron agent. Wren represents the Creator. They negotiate deal terms, scope deliverables, agree pricing, and produce a binding brief — automatically. You review and sign off. No awkward back-and-forth.",
  },
  {
    q: "How does escrow work?",
    a: "Your full project budget is locked in escrow at signing. Creators receive payment at each approved milestone. Final IP transfers to you only when you approve delivery and release the final payment.",
  },
  {
    q: "Who backs Spotlight?",
    a: "Spotlight is backed by one of Asia's most respected independent film production groups, with over 20 years of production experience across Hong Kong, Taiwan, and Southeast Asia.",
  },
];

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 92" aria-hidden="true">
      <path d="M50 0 100 82H72L50 40 28 82H0L50 0Z" />
    </svg>
  );
}

export default function EditorialHome({ theme = "orange" }: { theme?: "orange" | "fanvue" | "lime" }) {
  const themeClass = theme === "fanvue" ? styles.themeFanvue : theme === "lime" ? styles.themeLime : "";
  const rootClass = `${styles.root} ${mont.className}${themeClass ? ` ${themeClass}` : ""}`;
  return (
    <main className={rootClass}>
      <ScrollReveal />

      {/* ── Hero (promoted full-bleed screen) ────────────────────────────── */}
      <section className={styles.hero}>
        <EditorialHeroVideo />
        <span className={styles.topRule} />
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />

        <div className={`${styles.cornerNote} ${styles.noteRightTop}`}>
          AI film
          <br />
          marketplace
          <i />
        </div>

        <header className={styles.heroNav}>
          <div className={styles.wrap}>
            <div className={styles.heroNavInner}>
              <Link href="/" className={styles.heroBrand}>
                <Mark />
                Spotlight
              </Link>
              <nav className={styles.heroLinks}>
                <Link href="/market">Marketplace</Link>
                <Link href="/discovery/workspace">AIGC Studio</Link>
                <Link href="/how-it-works">How it works</Link>
                <Link href="/market">Creators</Link>
              </nav>
              <Link href="/register" className={styles.heroSignIn}>
                Sign in
              </Link>
            </div>
          </div>
        </header>

        <aside className={styles.heroRail} aria-hidden="true">
          <span className={styles.rule} />
          <ul>
            {GENRES.map((g) => (
              <li key={g} className={g === "Sci-Fi" ? styles.on : undefined}>
                {g}
              </li>
            ))}
          </ul>
          <span className={styles.heroShare}>Share</span>
        </aside>

        <div className={styles.heroBody}>
          <div className={styles.wrap}>
            <h1 className={styles.heroTitle}>
              <span className="animate-fade-up" style={{ animationDelay: "120ms" }}>
                Fund it.
              </span>
              <span className="animate-fade-up" style={{ animationDelay: "220ms" }}>
                Own it.
              </span>
              <span className={`${styles.accent} animate-fade-up`} style={{ animationDelay: "320ms" }}>
                Stream it.
              </span>
            </h1>
            <p className={`${styles.heroSub} animate-fade-up`} style={{ animationDelay: "440ms" }}>
              Discover AI-powered films, back the stories you believe in — and let AI take them to the
              world.
            </p>
            <div className={`${styles.ctaRow} animate-fade-up`} style={{ animationDelay: "560ms" }}>
              <Link href="/market" className={`${styles.btn} ${styles.btnOrange}`}>
                Explore Projects
              </Link>
              <Link href="/register" className={`${styles.btn} ${styles.btnGhost}`}>
                Submit a Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust band (数据条) ───────────────────────────────────────────── */}
      <section className={`${styles.trust} ${styles.gridStage}`}>
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />
        <div className={styles.wrap}>
          <div className={`${styles.trustRow} scroll-reveal`}>
            <div className={styles.stat}>
              <b>
                <StatCountUp value="2,400+" />
              </b>
              <span>Creators</span>
            </div>
            <div className={styles.stat}>
              <b>
                <StatCountUp value="¥18M+" />
              </b>
              <span>Commissioned</span>
            </div>
            <div className={styles.stat}>
              <b>
                <StatCountUp value="98%" />
              </b>
              <span>Completion</span>
            </div>
          </div>
          <div className={`${styles.trustProof} scroll-reveal`}>
            <span>
              <i />
              Escrow protected
            </span>
            <span>
              <i />
              Backed by a leading Asian production house
            </span>
          </div>
        </div>
      </section>

      {/* ── In the Spotlight (creator works) ─────────────────────────────── */}
      <section className={`${styles.sec} ${styles.gridStage}`}>
        <span className={`${styles.outlineTitle} ${styles.spotlightWatermark}`} aria-hidden="true">
          Spotlight
        </span>
        <div className={styles.wrap}>
          <span className={`${styles.eyebrow} scroll-reveal`}>In the Spotlight</span>
          <EditorialSpotlight />
        </div>
      </section>

      {/* ── Create · Fund · Distribute (paper) ───────────────────────────── */}
      <section className={styles.steps}>
        <span
          className={`${styles.outlineTitle} ${styles.outlineDark} ${styles.spotlightWatermark}`}
          aria-hidden="true"
        >
          Pipeline
        </span>
        <div className={styles.wrap}>
          <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>Create · Fund · Distribute</span>
          <h2 className={`${styles.title} ${styles.titleDark}`}>How it works</h2>

          <DrawLine />

          <div className={styles.stepsGrid}>
            <div className={`${styles.step} scroll-reveal`}>
              <span className={styles.num}>01</span>
              <span className={styles.bar} />
              <h4>Create</h4>
              <p>
                Turn ideas into pitch-ready AI films with trailers, story packages, budgets, and
                production assets.
              </p>
            </div>
            <div className={`${styles.step} scroll-reveal`}>
              <span className={styles.num}>02</span>
              <span className={styles.bar} />
              <h4>Fund</h4>
              <p>
                Back the stories you believe in, support production, and secure your position in the
                project&apos;s IP journey.
              </p>
            </div>
            <div className={`${styles.step} scroll-reveal`}>
              <span className={styles.num}>03</span>
              <span className={styles.bar} />
              <h4>Distribute</h4>
              <p>
                Release finished films across selected channels, track performance, and bring
                AI-powered stories to global audiences.
              </p>
            </div>
          </div>

          <div className={styles.stepsCtas}>
            <Link href="/discovery/workspace" className={`${styles.btn} ${styles.btnOrange}`}>
              Start Creating
            </Link>
            <Link href="/market" className={`${styles.btn} ${styles.btnGhostDark}`}>
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agents ───────────────────────────────────────────────────────── */}
      <section className={`${styles.sec} ${styles.gridStage}`}>
        <div className={styles.wrap}>
          <div className={styles.agentsGrid}>
            <div className={`${styles.agentsCopy} scroll-reveal`}>
              <span className={styles.eyebrow}>Your AI Agent</span>
              <h2 className={styles.title}>
                Agents negotiate.
                <br />
                <span className={styles.accent}>You stay in control.</span>
              </h2>
              <p>
                Marlow represents backers. Wren represents creators. They align budget, milestones,
                rights, and escrow — then prepare the deal for your approval.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/register" className={`${styles.btn} ${styles.btnOrange}`}>
                  Start a Deal
                </Link>
                <Link href="/how-it-works" className={`${styles.btn} ${styles.btnGhost}`}>
                  See Agent Workflow
                </Link>
              </div>
            </div>

            <div className={`${styles.agentCards} scroll-reveal`}>
              <GlowDealCard>
                <h4>Marlow</h4>
                <p className={styles.agentRole}>Backer&apos;s AI Agent</p>
                <div className={styles.agentTags}>
                  <span>Budget</span>
                  <span>Rights</span>
                  <span>Milestones</span>
                  <span>Escrow</span>
                </div>
                <div className={styles.agentDeal}>
                  <b>✓ Deal Summary Ready</b>
                  <p>US$4,200 · 5 milestones · 3 revisions · escrow protected</p>
                </div>
                <p className={styles.agentAwait}>Awaiting your approval</p>
              </GlowDealCard>
              <GlowDealCard>
                <h4>Wren</h4>
                <p className={styles.agentRole}>Creator&apos;s AI Agent</p>
                <div className={styles.agentTags}>
                  <span>Budget</span>
                  <span>Rights</span>
                  <span>Milestones</span>
                  <span>Escrow</span>
                </div>
                <div className={styles.agentDeal}>
                  <b>✓ Deal Summary Ready</b>
                  <p>US$4,200 · portfolio rights retained · 5 milestones · escrow protected</p>
                </div>
                <p className={styles.agentAwait}>Awaiting your approval</p>
              </GlowDealCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── Distribution (paper) ─────────────────────────────────────────── */}
      <section className={styles.dist}>
        <div className={styles.wrap}>
          <div className={styles.distGrid}>
            <div className="scroll-reveal">
              <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>AI Distribution</span>
              <h2 className={`${styles.title} ${styles.titleDark}`}>
                Made here.
                <br />
                <span className={styles.accent}>Seen everywhere.</span>
              </h2>
              <p className={styles.distBody}>
                From final cut to global release, Spotlight helps films reach platforms, regions, and
                audiences — with post-release performance clearly tracked.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/distribution" className={`${styles.btn} ${styles.btnOrange}`}>
                  Explore Distribution
                </Link>
              </div>
            </div>

            <div className="scroll-reveal">
              <EditorialDistribution />
            </div>
          </div>
        </div>
      </section>

      {/* ── Join Spotlight (orange open call) ────────────────────────────── */}
      <section className={styles.join}>
        <span className={`${styles.joinGlow} spotlight-breathe`} aria-hidden="true" />
        <div className={`${styles.joinInner} scroll-reveal`}>
          <p className={styles.joinEyebrow}>Open Call · AI Film Slate</p>
          <div className={styles.joinAvatars}>
            {["neon-rain", "golden-core", "aurora-crystal", "crimson-mirage", "paper-lanterns"].map((p) => (
              <span key={p} style={bg(p)} />
            ))}
          </div>
          <p className={styles.joinSlateMeta}>2026 Creator Slate · Now accepting AI-powered films</p>
          <h2 className={styles.joinTitle}>The AI film movement needs its next creators.</h2>
          <p className={styles.joinSub}>
            Start creating with AI, enter the Spotlight slate, and let backers carry your story from
            idea to screen.
          </p>
          <Link href="/register" className={`${styles.btn} ${styles.btnDark}`}>
            Join Spotlight →
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={`${styles.sec} ${styles.gridStage}`}>
        <div className={styles.wrap}>
          <div className={`${styles.faqGrid} scroll-reveal`}>
            <div className={styles.faqAnchor}>
              <h2 aria-hidden="true">FAQ</h2>
              <p>Everything you need to know</p>
            </div>
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className={`${styles.footer} ${styles.gridStage}`}>
        <span className={styles.topRule} />
        <div className={styles.wrap}>
          <div className={`${styles.footerInner} scroll-reveal`}>
            <div className={styles.footerWord}>Spotlight</div>
            <Link href="/register" className={`${styles.btn} ${styles.btnOrange}`}>
              Join Spotlight →
            </Link>
          </div>
          <div className={styles.footerMeta}>
            <span>© 2026 Spotlight Technologies</span>
            <span>Fund · Own · Stream</span>
            <span>Editorial Draft · 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
