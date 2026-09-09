import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tesra Cosmetics — Soft Glam Essentials",
  description:
    "Lashes, liners, and complexion essentials for everyday luxury. Shop Tesra Cosmetics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <CartDrawer />
            <ProfileCompletionModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
