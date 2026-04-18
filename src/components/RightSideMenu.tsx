"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Phone, Tag, Menu, X, Search } from "lucide-react";
import SearchBar from "@/components/SearchBar";

const menuItems = [
  { href: "/", label: "НҮҮР", Icon: Home },
  { href: "/contact", label: "ХОЛБОО БАРИХ", Icon: Phone },
  { href: "/products?sale=true", label: "ХЯМДРАЛТАЙ", Icon: Tag },
];

export default function RightSideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Search overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl">
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 hover:text-[#1e0acf] shadow"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
            <SearchBar />
          </div>
        </div>
      )}

      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40">
        <div className="rounded-full bg-white shadow-xl border border-gray-100 px-2 py-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-[#1e0acf] shadow-sm transition-all duration-300 ease-out hover:border-[#1e0acf] hover:shadow-lg"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className={`flex flex-col items-center gap-3 ${isOpen ? "mt-3" : "hidden"} md:mt-0 md:flex`}>
            {menuItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex items-center justify-center"
                aria-label={label}
                title={label}
                onClick={() => setIsOpen(false)}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-[#1e0acf] shadow-sm transition-all duration-500 ease-out group-hover:border-[#1e0acf] group-hover:shadow-lg group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#1e0acf]/30">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-[#1e0acf] px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            ))}
            {/* Search button */}
            <button
              type="button"
              onClick={() => { setIsSearchOpen((prev) => !prev); setIsOpen(false); }}
              className="group relative flex items-center justify-center"
              aria-label="Хайх"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-[#1e0acf] shadow-sm transition-all duration-500 ease-out group-hover:border-[#1e0acf] group-hover:shadow-lg group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#1e0acf]/30">
                <Search className="h-5 w-5" />
              </span>
              <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-[#1e0acf] px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                ХАЙХ
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
