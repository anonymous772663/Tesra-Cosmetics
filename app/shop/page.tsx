"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, ProductCategory } from "@/lib/types";
import { useCart } from "@/components/CartContext";

const CATEGORIES: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lashes", label: "Lashes" },
  { value: "concealer", label: "Concealer" },
  { value: "lip_liner", label: "Lip Liner" },
  { value: "eye_liner", label: "Eye Liner" },
  { value: "blender", label: "Blender" },
  { value: "lash_glue", label: "Lash Glue" },
];

type SortOption = "newest" | "price_low" | "price_high";

const MAX_PRICE = 3000;

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory | "all">(
    (searchParams.get("category") as ProductCategory) ?? "all"
  );
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [sort, setSort] = useState<SortOption>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        if (!mounted) return;
        setProducts((data as Product[]) ?? []);
        setIsLoading(false);
      });

    // Realtime: auto-sync when admin adds/edits/removes products
    const channel = supabase
      .channel("products-shop-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        supabase
          .from("products")
          .select("*")
          .then(({ data }) => setProducts((data as Product[]) ?? []));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") params.delete("category");
    else params.set("category", category);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= priceMax);
    if (category !== "all") list = list.filter((p) => p.category === category);

    switch (sort) {
      case "price_low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        list = [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
    return list;
  }, [products, category, priceMax, sort]);

  return (
    <main className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl text-berry-800">Shop</h1>
          <p className="text-sm text-berry-800/60 mt-1">{filtered.length} products</p>
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden pill-btn-secondary !px-4 !py-2 text-sm"
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Filters sidebar */}
        <aside className={`space-y-8 ${filtersOpen ? "block" : "hidden lg:block"}`}>
          <div>
            <h3 className="text-sm font-medium text-berry-800 mb-3">Category</h3>
            <ul className="space-y-1">
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <button
                    onClick={() => setCategory(c.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-pill text-sm transition-colors ${
                      category === c.value
                        ? "bg-berry-800 text-cream"
                        : "text-berry-800/70 hover:bg-white/60"
                    }`}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-berry-800 mb-3">Price range</h3>
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={50}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-berry-800/60 mt-1">
              <span>NPR 0</span>
              <span>NPR {priceMax.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-berry-800 mb-3">Sort by</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="input-field text-sm !py-2"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-soft bg-white/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-berry-800/60">
              <p>Nothing matches those filters yet.</p>
              <p className="text-sm mt-1">Try widening the price range or picking a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <div key={product.id} className="group glass-card overflow-hidden flex flex-col">
                  <Link href={`/product/${product.id}`} className="relative aspect-[3/4] block overflow-hidden">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 768px) 30vw, 45vw"
                      />
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-3 left-3 rounded-pill bg-berry-900/80 text-cream text-[11px] px-2.5 py-1">
                        Sold out
                      </span>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-sm font-medium text-berry-800 leading-snug line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm font-medium text-berry-800">
                        NPR {product.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => addItem(product, 1)}
                        disabled={product.stock === 0}
                        className="pill-btn-primary !px-3 !py-1.5 text-xs disabled:bg-berry-800/30"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
