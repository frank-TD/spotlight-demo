"use client";
import Link from "next/link";
import { useT } from "@/hooks/useT";

export default function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-outline-variant/30 -mx-6 md:-mx-12 px-6 md:px-12 py-16 md:py-20 bg-surface-dim">
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-2 space-y-5">
          <Link href="/" className="font-headline italic font-bold text-[28px] text-primary">
            Spotlight
          </Link>
          <p className="font-body text-sm text-on-surface-variant max-w-xs leading-relaxed">
            {t.landing.footerTagline}
          </p>
        </div>
        <FooterCol
          heading={t.landing.footerPlatform}
          links={[
            { label: t.landing.footerDiscover, href: "/discovery" },
            { label: t.landing.footerMarketplace, href: "/market" },
            { label: t.landing.footerStudio, href: "/discovery/workspace" },
            { label: t.landing.footerForCreators, href: "/market/creators" },
          ]}
        />
        <FooterCol
          heading={t.landing.footerCompany}
          links={[
            { label: t.landing.footerAbout, href: "#" },
            { label: t.landing.footerCareers, href: "#" },
            { label: t.landing.footerPress, href: "#" },
            { label: t.landing.footerSupport, href: "#" },
          ]}
        />
        <FooterCol
          heading={t.landing.footerLegal}
          links={[
            { label: t.landing.footerTerms, href: "#" },
            { label: t.landing.footerPrivacy, href: "#" },
            { label: t.landing.footerIp, href: "#" },
            { label: t.landing.footerEscrow, href: "#" },
          ]}
        />
      </div>

      <div className="max-w-[1280px] mx-auto mt-14 pt-7 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
        <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/70">
          {t.landing.footerCopyright}
        </p>
        <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/60 text-right">
          {t.landing.footerDisclaimer}
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary mb-4">
        {heading}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="font-body text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
