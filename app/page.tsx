import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase.from("site_settings").select("*").limit(1).single();
  return (data as SiteSettings) ?? null;
}

const CATEGORY_SHOWCASE = [
  {
    name: "Lashes",
    href: "/shop?category=lashes",
    blurb: "Single pairs to value packs, in flares built for Kathmandu humidity.",
    image: "https://images.unsplash.com/photo-1583241800698-e8ab01c98722?w=900",
  },
  {
    name: "Concealer",
    href: "/shop?category=concealer",
    blurb: "Four shades, one crease-proof formula.",
    image: "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=900",
  },
  {
    name: "Lip & Eye Liner",
    href: "/shop?category=lip_liner",
    blurb: "Two shades each, made to outlast a full workday.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900",
  },
  {
    name: "Tools",
    href: "/shop?category=blender",
    blurb: "The blender and the glue that make everything else work.",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=900",
  },
];

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <main>
      {settings?.announcement_banner && (
        <div className="bg-berry-gradient text-cream text-center text-sm py-2 px-4">
          {settings.announcement_banner}
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-fade-up">
            <p className="text-rose-600 font-medium mb-4">Tesra Cosmetics</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-berry-800 max-w-xl">
              {settings?.hero_heading ?? "Soft glam, made to last."}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-berry-800/70 max-w-md leading-relaxed">
              {settings?.hero_subheading ??
                "Lashes, liners, and complexion essentials for everyday luxury."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="pill-btn-primary">
                Shop the collection
              </Link>
              <Link href="/about" className="pill-btn-secondary">
                Our story
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-rose-300/30 blur-3xl" aria-hidden />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] glass-card">
              <Image
                src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1000"
                alt="Tesra Cosmetics lash and concealer essentials laid out on a vanity"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 45vw, 90vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category showcase — asymmetric grid, not a uniform card kit */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl text-berry-800">Shop by category</h2>
          <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm text-berry-800/70 hover:text-berry-800">
            View everything <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CATEGORY_SHOWCASE.map((cat, i) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`group relative overflow-hidden rounded-soft glass-card ${
                i === 0 ? "sm:col-span-2 aspect-[16/8]" : "aspect-[16/11]"
              }`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-berry-900/70 via-berry-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl sm:text-2xl text-cream">{cat.name}</h3>
                <p className="mt-1 text-sm text-cream/80 max-w-sm">{cat.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
