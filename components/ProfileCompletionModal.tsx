"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, User as UserIcon, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export default function ProfileCompletionModal() {
  const { user, needsOnboarding, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!needsOnboarding || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !city.trim() || !address.trim() || !phone.trim()) {
      setError("Every field is needed so Danfe Express can find your door.");
      return;
    }
    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        profile_completed: true,
      })
      .eq("id", user.id);

    setIsSaving(false);

    if (updateError) {
      setError("That didn't save — please try again.");
      return;
    }

    await refreshProfile();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-berry-900/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-soft bg-white/90 backdrop-blur-xl border border-white shadow-glass-hover p-8"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <h2 className="text-2xl text-berry-800 mb-1">Where should we send it?</h2>
          <p className="text-sm text-berry-800/70 mb-6">
            Tell us who you are and where you are, once, so checkout is one tap from now on.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={<UserIcon size={16} />} label="Full name">
              <input
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sujata Shrestha"
                autoFocus
              />
            </Field>

            <Field icon={<MapPin size={16} />} label="City">
              <input
                className="input-field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kathmandu"
              />
            </Field>

            <Field icon={<Home size={16} />} label="Detailed address">
              <textarea
                className="input-field resize-none"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ward no., street, landmark"
              />
            </Field>

            <Field icon={<Phone size={16} />} label="Contact number">
              <input
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                type="tel"
              />
            </Field>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button type="submit" disabled={isSaving} className="pill-btn-primary w-full mt-2">
              {isSaving ? "Saving..." : "Save and continue"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-medium text-berry-800/70 mb-1.5">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
