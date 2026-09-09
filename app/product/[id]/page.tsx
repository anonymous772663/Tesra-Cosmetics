"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartContext";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setIsLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        const p = data as Product | null;
        setProduct(p);
        setSelectedShade(p?.shades?.[0]);
        setIsLoading(false);
      });
  }, [params?.id]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-16 grid md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-soft bg-white/40 animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-white/40 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-white/40 animate-pulse" />
          <div className="h-24 w-full rounded bg-white/40 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl text-berry-800">We couldn't find that product.</h1>
        <Link href="/shop" className="pill-btn-primary inline-flex mt-6">
          Back to shop
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedShade);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-berry-800/60 hover:text-berry-800 mb-8">
        <ChevronLeft size={16} /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-soft glass-card mb-3">
            {product.images[activeImage] && (
              <Image
                src={product.images[activeImage]}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 45vw, 90vw"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? "border-rose-500" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-600 mb-2">
            {product.category.replace("_", " ")}
          </p>
          <h1 className="text-3xl text-berry-800">{product.title}</h1>
          <p className="mt-3 text-xl font-medium text-berry-800">
            NPR {product.price.toLocaleString()}
          </p>

          <p className="mt-6 text-berry-800/75 leading-relaxed max-w-md">{product.description}</p>

          <div className="mt-6">
            <span
              className={`inline-flex items-center gap-1.5 text-sm rounded-pill px-3 py-1 ${
                product.stock > 0 ? "bg-green-100 text-green-800" : "bg-berry-100 text-berry-800"
              }`}
            >
              {product.stock > 0 ? `In stock — ${product.stock} left` : "Out of stock"}
            </span>
          </div>

          {product.shades && product.shades.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-berry-800 mb-2">Shade</h3>
              <div className="flex flex-wrap gap-2">
                {product.shades.map((shade) => (
                  <button
                    key={shade}
                    onClick={() => setSelectedShade(shade)}
                    className={`px-4 py-2 rounded-pill text-sm border transition-colors ${
                      selectedShade === shade
                        ? "bg-berry-800 text-cream border-berry-800"
                        : "border-berry-800/20 text-berry-800/70 hover:bg-white/60"
                    }`}
                  >
                    {shade}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-pill bg-white/70 px-2 py-1.5 border border-berry-800/10">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 text-berry-800/70 hover:text-berry-800"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 text-berry-800/70 hover:text-berry-800"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="pill-btn-primary flex-1 sm:flex-none sm:px-10 disabled:bg-berry-800/30"
            >
              {justAdded ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                "Add to cart"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
