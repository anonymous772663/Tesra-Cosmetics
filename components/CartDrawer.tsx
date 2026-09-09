"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "./CartContext";
import { getDeliveryFeeForZone } from "@/lib/delivery";
import { useAuth } from "./AuthContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const { profile } = useAuth();

  const { fee, isFree, zone } = getDeliveryFeeForZone(profile?.city ?? "Other Districts", subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-berry-900/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col bg-cream shadow-glass-hover"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-berry-800/10">
              <h2 className="text-xl text-berry-800">Your bag</h2>
              <button onClick={closeCart} aria-label="Close cart" className="p-1.5 rounded-full hover:bg-blush-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-berry-800/60 gap-2">
                  <p>Your bag is empty.</p>
                  <p className="text-sm">Add a lash pack or a shade you love to get started.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.shade ?? "default"}`}
                      className="flex gap-3 glass-card p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-100">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-berry-800 truncate">{item.product.title}</p>
                        {item.shade && <p className="text-xs text-berry-800/60">{item.shade}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-pill bg-white px-1.5 py-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.shade)}
                              className="p-1 text-berry-800/70 hover:text-berry-800"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.shade)}
                              className="p-1 text-berry-800/70 hover:text-berry-800"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-berry-800">
                            NPR {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.shade)}
                        aria-label="Remove item"
                        className="self-start p-1 text-berry-800/40 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-berry-800/10 px-6 py-5 space-y-3">
                <div className="flex justify-between text-sm text-berry-800/70">
                  <span>Subtotal</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-berry-800/70">
                  <span>Danfe Express delivery ({zone})</span>
                  <span>{isFree ? "Free" : `NPR ${fee}`}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-berry-800 pt-1">
                  <span>Total</span>
                  <span>NPR {(subtotal + fee).toLocaleString()}</span>
                </div>
                <button className="pill-btn-primary w-full mt-2">Checkout</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
