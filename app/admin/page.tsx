"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Package, AlertTriangle, DollarSign, Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";
import type { Product, ProductCategory, SiteSettings } from "@/lib/types";

const CATEGORY_OPTIONS: ProductCategory[] = [
  "lashes",
  "concealer",
  "lip_liner",
  "eye_liner",
  "blender",
  "lash_glue",
];

const LOW_STOCK_THRESHOLD = 15;

const emptyDraft = {
  title: "",
  description: "",
  category: "lashes" as ProductCategory,
  price: 0,
  stock: 0,
  images: "",
};

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [registeredCount, setRegisteredCount] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [isLoading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    supabase.from("products").select("*").order("created_at", { ascending: false }).then(
      ({ data }) => setProducts((data as Product[]) ?? [])
    );
    supabase.from("site_settings").select("*").limit(1).single().then(
      ({ data }) => setSettings(data as SiteSettings)
    );
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setRegisteredCount(count ?? 0));
  }, [isAdmin]);

  if (isLoading || !isAdmin) {
    return <main className="mx-auto max-w-3xl px-5 py-24 text-center text-berry-800/60">Loading dashboard…</main>;
  }

  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft({
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      images: p.images.join(", "),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const saveProduct = async () => {
    if (!draft.title.trim()) return;
    setSavingProduct(true);

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      price: Number(draft.price),
      stock: Number(draft.stock),
      images: draft.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      shades: null,
    };

    if (editingId) {
      const { data } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (data) setProducts((prev) => prev.map((p) => (p.id === editingId ? (data as Product) : p)));
    } else {
      const { data } = await supabase.from("products").insert(payload).select().single();
      if (data) setProducts((prev) => [data as Product, ...prev]);
    }

    setSavingProduct(false);
    resetForm();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    await supabase
      .from("site_settings")
      .update({
        primary_color: settings.primary_color,
        accent_color: settings.accent_color,
        announcement_banner: settings.announcement_banner,
        hero_heading: settings.hero_heading,
        hero_subheading: settings.hero_subheading,
      })
      .eq("id", settings.id);
    setSavingSettings(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <h1 className="text-3xl text-berry-800 mb-8">Admin dashboard</h1>

      {/* Analytics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard icon={<Users size={18} />} label="Registered users" value={registeredCount ?? "—"} />
        <StatCard icon={<Package size={18} />} label="Products" value={products.length} />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Low stock"
          value={lowStock.length}
          tone={lowStock.length > 0 ? "warning" : "default"}
        />
        <StatCard
          icon={<DollarSign size={18} />}
          label="Inventory value"
          value={`NPR ${inventoryValue.toLocaleString()}`}
        />
      </section>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        {/* Product CMS */}
        <section>
          <h2 className="text-xl text-berry-800 mb-4">Product catalog</h2>

          <div className="glass-card p-5 mb-6 space-y-3">
            <p className="text-sm font-medium text-berry-800">
              {editingId ? "Edit product" : "Add a new product"}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="input-field"
                placeholder="Title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <select
                className="input-field"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as ProductCategory })}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                className="input-field"
                type="number"
                placeholder="Price (NPR)"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
              <input
                className="input-field"
                type="number"
                placeholder="Stock"
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
              />
            </div>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="Image URLs, comma-separated"
              value={draft.images}
              onChange={(e) => setDraft({ ...draft, images: e.target.value })}
            />
            <div className="flex gap-3">
              <button onClick={saveProduct} disabled={savingProduct} className="pill-btn-primary">
                <Plus size={16} />
                {editingId ? "Save changes" : "Add product"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="pill-btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </div>

          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 glass-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-berry-800 truncate">{p.title}</p>
                  <p className="text-xs text-berry-800/60">
                    {p.category.replace("_", " ")} · NPR {p.price.toLocaleString()} · Stock {p.stock}
                    {p.stock <= LOW_STOCK_THRESHOLD && (
                      <span className="text-amber-600 font-medium"> · Low</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 rounded-full hover:bg-blush-100 text-berry-800/70"
                    aria-label="Edit product"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 rounded-full hover:bg-blush-100 text-rose-600"
                    aria-label="Delete product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Site customizer */}
        <section>
          <h2 className="text-xl text-berry-800 mb-4">Site customizer</h2>
          {settings && (
            <div className="glass-card p-5 space-y-4">
              <Field label="Primary color">
                <input
                  type="color"
                  className="h-10 w-full rounded-lg border border-berry-800/10"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                />
              </Field>
              <Field label="Accent color">
                <input
                  type="color"
                  className="h-10 w-full rounded-lg border border-berry-800/10"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                />
              </Field>
              <Field label="Announcement banner">
                <input
                  className="input-field"
                  placeholder="e.g. Free Danfe delivery over NPR 5,000"
                  value={settings.announcement_banner ?? ""}
                  onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
                />
              </Field>
              <Field label="Hero heading">
                <input
                  className="input-field"
                  value={settings.hero_heading}
                  onChange={(e) => setSettings({ ...settings, hero_heading: e.target.value })}
                />
              </Field>
              <Field label="Hero subheading">
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  value={settings.hero_subheading}
                  onChange={(e) => setSettings({ ...settings, hero_subheading: e.target.value })}
                />
              </Field>
              <button onClick={saveSettings} disabled={savingSettings} className="pill-btn-primary w-full">
                {savingSettings ? "Saving..." : "Publish changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "default" | "warning";
}) {
  return (
    <div className="glass-card p-4">
      <div
        className={`inline-flex p-2 rounded-full mb-3 ${
          tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-medium text-berry-800">{value}</p>
      <p className="text-xs text-berry-800/60 mt-0.5">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-berry-800/70 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
