"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="mx-auto max-w-4xl px-5 sm:px-8 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-3xl sm:text-4xl text-berry-800 mb-6">Contact us</h1>
        <div className="space-y-4 text-berry-800/75">
          <p className="flex items-center gap-2"><Mail size={16} /> hello@tesracosmetics.com</p>
          <p className="flex items-center gap-2"><Phone size={16} /> +977 1-XXXXXXX</p>
          <p className="flex items-center gap-2"><MapPin size={16} /> Kathmandu, Nepal</p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="glass-card p-6 space-y-4"
      >
        <input className="input-field" placeholder="Your name" required />
        <input className="input-field" type="email" placeholder="Your email" required />
        <textarea className="input-field resize-none" rows={4} placeholder="Message" required />
        <button className="pill-btn-primary w-full" type="submit">
          {sent ? "Sent — thank you" : "Send message"}
        </button>
      </form>
    </main>
  );
}
