"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User as UserIcon, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { totalCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-blush-100/70 backdrop-blur-lg border-b border-white/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Wordmark */}
          <Link href="/" className="shrink-0 select-none">
            <span className="font-display text-2xl tracking-tight text-berry-800">
              Tesra
            </span>
            <span className="font-display text-2xl tracking-tight text-rose-500"> Cosmetics</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors ${
                    active ? "text-berry-800" : "text-berry-800/60 hover:text-berry-800"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-[2px] bg-rose-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block relative">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search shades, lashes..."
                    className="input-field !py-2 !rounded-pill text-sm mr-2"
                  />
                )}
              </AnimatePresence>
              <button
                aria-label="Search"
                onClick={() => setSearchOpen((s) => !s)}
                className="p-2 rounded-full hover:bg-white/60 text-berry-800 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>

            <button
              aria-label={`Cart, ${totalCount} items`}
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-white/60 text-berry-800 transition-colors"
            >
              <ShoppingBag size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {totalCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-pill bg-white/60 pl-1 pr-3 py-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-berry-800 text-cream text-xs font-semibold">
                    {(profile?.full_name ?? user.email ?? "T")[0].toUpperCase()}
                  </span>
                  <span className="text-sm text-berry-800 max-w-[100px] truncate">
                    {profile?.full_name?.split(" ")[0] ?? "Account"}
                  </span>
                </div>
                <button
                  aria-label="Sign out"
                  onClick={() => signOut()}
                  className="p-2 rounded-full hover:bg-white/60 text-berry-800/70 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex pill-btn-primary !px-5 !py-2 text-sm">
                <UserIcon size={16} />
                Login
              </Link>
            )}

            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-full hover:bg-white/60 text-berry-800"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/60 bg-blush-100/95"
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-berry-800 text-base py-1"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button onClick={() => signOut()} className="pill-btn-secondary w-full mt-1">
                  <LogOut size={16} /> Sign out
                </button>
              ) : (
                <Link href="/login" className="pill-btn-primary w-full mt-1">
                  <UserIcon size={16} /> Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
