"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";

const navigation = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Demo", href: "/check#demo" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="shell flex h-[76px] items-center justify-between gap-6">
        <Link href="/" className="brand" aria-label="DefiOra home" onClick={closeMenu}>
          <span className="brand-mark"><Icon name="shieldCheck" width={19} height={19} /></span>
          <span>
            <span className="brand-name">DefiOra</span>
            <span className="brand-tagline">Smarter checks. Safer submissions.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="/check" className="button button-primary button-small">
            Open Checkpoint <Icon name="arrowUpRight" width={16} height={16} />
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <Icon name={menuOpen ? "x" : "menu"} width={22} height={22} />
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="mobile-navigation lg:hidden">
          <nav className="shell grid gap-1 py-3" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className="mobile-nav-link" onClick={closeMenu}>
                {item.label}
                <Icon name="arrowUpRight" width={16} height={16} />
              </Link>
            ))}
            <Link href="/check" className="button button-primary mt-2 justify-center" onClick={closeMenu}>
              Open Checkpoint <Icon name="arrowUpRight" width={16} height={16} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
