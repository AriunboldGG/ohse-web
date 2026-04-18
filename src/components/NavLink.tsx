"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative font-medium uppercase transition-colors ${
        isActive
          ? "text-[#1e0acf] hover:text-[#1e0acf]"
          : "text-gray-800 hover:text-[#1e0acf]"
      }`}
    >
      {children}
      <span
        className={`absolute left-1/2 -translate-x-1/2 -bottom-2 h-[3px] rounded-full bg-[#1e0acf] shadow-[0_2px_6px_rgba(31,99,43,0.35)] transition-all duration-200 ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

