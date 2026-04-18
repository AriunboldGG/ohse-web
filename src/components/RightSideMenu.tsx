 "use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Phone, Tag, Menu, X } from "lucide-react";

const menuItems = [
  { href: "/", label: "НҮҮР", Icon: Home },
  { href: "/contact", label: "ХОЛБОО БАРИХ", Icon: Phone },
  { href: "/products?sale=true", label: "ХЯМДРАЛТАЙ", Icon: Tag },
];

export default function RightSideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="rounded-full bg-white shadow-xl border border-gray-100 px-2 py-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-[#1f632b] shadow-sm transition-all duration-300 ease-out hover:border-[#1f632b] hover:shadow-lg"
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
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-[#1f632b] shadow-sm transition-all duration-500 ease-out group-hover:border-[#1f632b] group-hover:shadow-lg group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#1f632b]/30">
                <Icon className="h-5 w-5" />
              </span>
              <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-[#1f632b] px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
