import Link from "next/link";
import { Montserrat } from "next/font/google";
import EditorialDistribution from "./EditorialDistribution";
import EditorialDirectors from "./EditorialDirectors";
import EditorialGhost from "./EditorialGhost";
import EditorialHeroVideo from "./EditorialHeroVideo";
import EditorialGetstaked from "./EditorialGetstaked";
import EditorialNegotiationCard from "./EditorialNegotiationCard";
import { DrawLine, FaqAccordion } from "./motion";
import styles from "./editorial.module.css";
import StatCountUp from "@/components/home/StatCountUp";
import ScrollReveal from "@/components/home/ScrollReveal";
import { NexgcMenu } from "@/components/layout/TopNav";

// The editorial homepage body, shared by every colour variant. The whole
// palette is scoped under `.root` and the accent is driven by two CSS vars
// (--orange / --orange-deep), so a variant only needs to add a theme class
// that overrides them — the markup is identical. `theme` selects that class:
// "orange" is the original; "fanvue" retints to the brand green; "lime" is the
// all-dark Black + Lime palette.

const mont = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

const bg = (name: string) => ({ backgroundImage: `url(/posters/${name}.jpg)` });

// Questions carry a flame-highlighted keyword, as in the mockup.
const FAQ_ITEMS = [
  {
    id: "marketplace",
    q: (
      <>
        Is this like <span className={styles.faqHot}>Fiverr or Upwork?</span>
      </>
    ),
    a: "No. Getstaked is a content commissioning platform, not a task marketplace. You commission full productions — brief to broadcast-ready — with IP protection and AI-managed delivery. Think executive producer, not task manager.",
  },
  {
    id: "patron",
    q: (
      <>
        What does a <span className={styles.faqHot}>Patron</span> do?
      </>
    ),
    a: "You fund and direct content. Post your creative brief, set your budget, and own the final work. Marlow, your AI agent, handles negotiation, scoping, and brief production. You review and approve.",
  },
  {
    id: "agents",
    q: (
      <>
        How do <span className={styles.faqHot}>Marlow and Wren</span> work?
      </>
    ),
    a: "Marlow is your AI Patron agent. Wren represents the Creator. They negotiate deal terms, scope deliverables, agree pricing, and produce a binding brief — automatically. You review and sign off. No awkward back-and-forth.",
  },
  {
    id: "escrow",
    q: (
      <>
        How does <span className={styles.faqHot}>escrow</span> work?
      </>
    ),
    a: "Your full project budget is locked in escrow at signing. Creators receive payment at each approved milestone. Final IP transfers to you only when you approve delivery and release the final payment.",
  },
  {
    id: "backers",
    q: (
      <>
        Who backs <span className={styles.faqHot}>Getstaked?</span>
      </>
    ),
    a: "Getstaked is backed by one of Asia's most respected independent film production groups, with over 20 years of production experience across Hong Kong, Taiwan, and Southeast Asia.",
  },
];

function Mark({ className }: { className?: string }) {
  // Getstaked play-mark: rounded tile with a play triangle.
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="24" />
      <path d="M40 30 74 50 40 70Z" fill="var(--ink, #0a1f1b)" />
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

        <header className={styles.heroNav}>
          <div className={styles.wrap}>
            <div className={styles.heroNavInner}>
              <Link href="/" className={styles.heroBrand}>
                <Mark />
                Getstaked
              </Link>
              <nav className={styles.heroLinks}>
                <Link href="/market">Marketplace</Link>
                <NexgcMenu active={false} label="NexGC" triggerClassName={styles.heroNexgc} />
                <Link href="/how-it-works">How it works</Link>
              </nav>
              <Link href="/login" className={styles.heroSignIn}>
                Sign in
              </Link>
            </div>
          </div>
        </header>

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
        {/* Mockup's parting line at the hero's foot */}
        <p className={`${styles.heroTicker} animate-fade-up`} style={{ animationDelay: "760ms" }}>
          Don&apos;t send me away
        </p>
      </section>

      {/* ── Trust band (数据条) ───────────────────────────────────────────── */}
      <section className={`${styles.trust} ${styles.gridStage}`}>
        <span className={`${styles.axis} ${styles.axisLeft}`} />
        <span className={`${styles.axis} ${styles.axisRight}`} />
        <div className={styles.wrap}>
          <div className={styles.trustRow}>
            <div className={`${styles.stat} scroll-reveal`}>
              <b>
                <StatCountUp value="2,400+" />
              </b>
              <span>Creators</span>
            </div>
            <div className={`${styles.stat} scroll-reveal`} style={{ animationDelay: "0.14s" }}>
              <b>
                <StatCountUp value="1,000+" />
              </b>
              <span>Backers</span>
            </div>
            <div className={`${styles.stat} scroll-reveal`} style={{ animationDelay: "0.28s" }}>
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

      {/* ── TOP Of The Week — plain mid-weight header, straight off the
             mockup (no eyebrow, no outline watermark) ─────────────────────── */}
      <section className={`${styles.sec} ${styles.gridStage}`}>
        <div className={styles.wrap}>
          <h2 className={`${styles.towTitle} scroll-reveal`}>TOP Of The Week</h2>
          <EditorialGetstaked />
        </div>
      </section>

      {/* ── Featured Directors (sage interlude) ──────────────────────────── */}
      <EditorialDirectors />

      {/* ── Create · Fund · Distribute ───────────────────────────────────── */}
      <section className={styles.steps}>
        <div className={styles.wrap}>
          <div className={styles.hiwGrid}>
            <div className="scroll-reveal">
              <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
                Create · Fund · Distribute
              </span>
              <h2 className={`${styles.title} ${styles.titleDark}`}>How it works</h2>
              <p className={styles.hiwIntro}>
                From creator to distributor, we&apos;ve got you covered — three moves take a story
                from first pitch to worldwide release.
              </p>
              <DrawLine />
            </div>

            {/* Glass gradient cards fan open one by one on scroll */}
            <div className={`${styles.glassStack} scroll-reveal`}>
              <div className={styles.glassCard}>
                <b>01</b>
                <h4>Create</h4>
                <p>Turn ideas into pitch-ready AI films with trailers, story packages and budgets.</p>
              </div>
              <div className={styles.glassCard}>
                <b>02</b>
                <h4>Fund</h4>
                <p>Back the stories you believe in and secure your position in the IP journey.</p>
              </div>
              <div className={styles.glassCard}>
                <b>03</b>
                <h4>Distribute</h4>
                <p>Release finished films across channels and track every market they reach.</p>
              </div>
            </div>
          </div>

          <div className={styles.stepsCtas}>
            <Link href="/discovery/workspace" className={`${styles.btn} ${styles.btnOrange}`}>
              Start Creating
            </Link>
            <Link
              href="/discovery/workspace?mode=pro"
              className={`${styles.btn} ${styles.btnGhostDark}`}
            >
              NexGC Pro · Short Drama
            </Link>
            <Link href="/market" className={`${styles.btn} ${styles.btnGhostDark}`}>
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agents — the mockup stages this one dark, phone glowing ──────── */}
      <section className={`${styles.sec} ${styles.agentsDark}`}>
        <div className={`${styles.wrap} ${styles.agentsStage}`}>
          <div className="scroll-reveal">
            <span className={styles.eyebrow}>Your AI Agents</span>
            <h2 className={styles.agentsTitleXl}>
              AI Agents <span className={styles.accent}>Negotiate</span>
            </h2>
            <p className={styles.agentsSubXl}>
              Marlow represents backers. Wren represents creators. They align the whole deal — then
              hand it to you for approval.
            </p>
          </div>

          <div className={`${styles.phoneArena} scroll-reveal`}>
            <div className={styles.agentSide}>
              <div className={styles.agentChip}>
                <b>Marlow</b>
                <span>Backer&apos;s agent</span>
              </div>
              <div className={styles.agentChip} data-delay="1">
                <b>Wren</b>
                <span>Creator&apos;s agent</span>
              </div>
            </div>

            <div className={styles.phoneShell}>
              <span className={styles.phoneNotch} />
              <EditorialNegotiationCard />
            </div>

            <div className={`${styles.agentPoints} ${styles.agentSideR}`}>
              <span className={styles.agentPoint} data-delay="2"><i />They align · Budget</span>
              <span className={styles.agentPoint} data-delay="3"><i />Milestones</span>
              <span className={styles.agentPoint} data-delay="4"><i />Rights</span>
              <span className={styles.agentPoint} data-delay="5"><i />Escrow — you approve the deal</span>
            </div>
          </div>

          <div className={`${styles.agentsCtas} scroll-reveal`}>
            <Link href="/register" className={`${styles.btn} ${styles.btnOrange}`}>
              Start a Deal
            </Link>
            <Link href="/how-it-works" className={`${styles.btn} ${styles.btnGhost}`}>
              See Agent Workflow
            </Link>
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
                From final cut to global release, Getstaked helps films reach platforms, regions, and
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

      {/* ── Join Getstaked (orange open call) ────────────────────────────── */}
      <section className={styles.join} style={{ position: "relative" }}>
        <span className={`${styles.joinGlow} spotlight-breathe`} aria-hidden="true" />
        <EditorialGhost />
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
            Start creating with AI, enter the Getstaked slate, and let backers carry your story from
            idea to screen.
          </p>
          <Link href="/register" className={`${styles.btn} ${styles.btnDark}`}>
            Join Getstaked →
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
            <div className={styles.footerWord}>Getstaked</div>
            <Link href="/register" className={`${styles.btn} ${styles.btnOrange}`}>
              Join Getstaked →
            </Link>
          </div>
          <div className={styles.footerMeta}>
            <span>© 2026 Getstaked Technologies</span>
            <span>Fund · Own · Stream</span>
            <span>Editorial Draft · 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
