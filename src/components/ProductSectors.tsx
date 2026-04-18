"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { IconType } from "react-icons";
import { 
  FaBuilding, 
  FaFire, 
  FaRoad, 
  FaMountain, 
  FaIndustry, 
  FaBolt,
  FaShieldAlt,
  FaTools,
  FaBox,
  FaHardHat,
  FaTruck,
  FaWarehouse,
  FaFlask,
  FaLeaf,
  FaRecycle,
  FaHammer,
  FaBriefcase,
  FaHandsHelping
} from "react-icons/fa";
import { getSectors, type Sector } from "@/lib/products";
import FirebaseImage from "@/components/FirebaseImage";

// Icon mapping for sectors
const iconMap: Record<string, IconType> = {
  FaBuilding,
  FaFire,
  FaRoad,
  FaMountain,
  FaIndustry,
  FaBolt,
  FaShieldAlt,
  FaTools,
  FaBox,
  FaHardHat,
  FaTruck,
  FaWarehouse,
  FaFlask,
  FaLeaf,
  FaRecycle,
  FaHammer,
  FaBriefcase,
  FaHandsHelping,
};

// Default icon if sector doesn't have one
const DefaultIcon = FaBox;

const keywordIconMap: Array<{ keywords: string[]; icon: IconType }> = [
  { keywords: ["барилга", "construction", "build"], icon: FaHardHat },
  { keywords: ["гал", "fire"], icon: FaFire },
  { keywords: ["зам", "road"], icon: FaRoad },
  { keywords: ["уул", "mine", "mining"], icon: FaMountain },
  { keywords: ["үйлдвэр", "industry", "factory"], icon: FaIndustry },
  { keywords: ["цахилгаан", "energy", "electric"], icon: FaBolt },
  { keywords: ["хамгаал", "safety", "hse"], icon: FaShieldAlt },
  { keywords: ["багаж", "tool"], icon: FaTools },
  { keywords: ["агуулах", "warehouse", "storage"], icon: FaWarehouse },
  { keywords: ["тээвэр", "transport", "logistic"], icon: FaTruck },
  { keywords: ["хими", "chemical", "lab"], icon: FaFlask },
  { keywords: ["ногоон", "eco", "environment"], icon: FaLeaf },
  { keywords: ["дахин", "recycle"], icon: FaRecycle },
  { keywords: ["засвар", "service", "maintenance"], icon: FaHammer },
  { keywords: ["зөвлөх", "service", "support"], icon: FaHandsHelping },
  { keywords: ["офис", "business", "office"], icon: FaBriefcase },
];

function resolveSectorIcon(sector: Sector): IconType {
  if (sector.icon && iconMap[sector.icon]) {
    return iconMap[sector.icon];
  }
  const name = `${sector.name || ""} ${sector.slug || ""}`.toLowerCase();
  for (const entry of keywordIconMap) {
    if (entry.keywords.some((keyword) => name.includes(keyword))) {
      return entry.icon;
    }
  }
  return DefaultIcon;
}

type ProductSectorsVariant = "inline" | "floating" | "hex";

export default function ProductSectors({
  variant = "inline",
}: {
  variant?: ProductSectorsVariant;
}) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  useEffect(() => {
    async function fetchSectors() {
      try {
        setIsLoading(true);
        const sectorsData = await getSectors();
        setSectors(sectorsData);
      } catch (error) {
        setSectors([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSectors();
  }, []);

  const iconAssignments = useMemo(() => {
    const used = new Set<IconType>();
    const assigned = new Map<string, IconType>();
    const fallbackIcons: IconType[] = [
      FaHardHat,
      FaFire,
      FaRoad,
      FaMountain,
      FaIndustry,
      FaBolt,
      FaShieldAlt,
      FaTools,
      FaWarehouse,
      FaTruck,
      FaFlask,
      FaLeaf,
      FaRecycle,
      FaHammer,
      FaBriefcase,
      FaHandsHelping,
      FaBox,
    ];

    sectors.forEach((sector) => {
      let icon = resolveSectorIcon(sector);
      if (used.has(icon)) {
        const next = fallbackIcons.find((candidate) => !used.has(candidate));
        if (next) {
          icon = next;
        }
      }
      assigned.set(sector.id, icon);
      used.add(icon);
    });

    return assigned;
  }, [sectors]);

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Бүтээгдэхүүний салбарын ангилал</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (sectors.length === 0) {
    return null;
  }

  if (variant === "floating") {
    const visibleSectors = sectors.slice(0, 7);
    return (
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setIsFloatingOpen((prev) => !prev)}
          className="md:hidden h-12 w-12 rounded-full bg-[#1f632b] text-white text-lg font-semibold shadow-lg flex items-center justify-center"
          aria-label="Салбар"
        >
          ☰
        </button>
        <div
          className={`rounded-full bg-white shadow-xl border border-gray-100 px-2 py-3 overflow-visible ${
            isFloatingOpen ? "flex" : "hidden"
          } md:flex`}
        >
          <div className="flex flex-col items-center gap-3">
            {visibleSectors.map((sector) => {
              const Icon = iconAssignments.get(sector.id) || resolveSectorIcon(sector);
              return (
                <Link
                  key={sector.id}
                  href={`/products?sector=${encodeURIComponent(sector.name)}`}
                  className="group relative flex items-center justify-center"
                  aria-label={sector.name}
                  onClick={() => setIsFloatingOpen(false)}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-[#1f632b] shadow-sm transition-all group-hover:border-[#1f632b] group-hover:shadow-md">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-[#1f632b] px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {sector.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "hex") {
    return (
      <div className="w-full">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Бүтээгдэхүүний салбарын ангилал</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6 px-0">
          {sectors.map((sector) => {
            const Icon = iconAssignments.get(sector.id) || resolveSectorIcon(sector);
            return (
              <Link
                key={sector.id}
                href={`/products?sector=${encodeURIComponent(sector.name)}`}
                className="group relative flex flex-col items-center gap-2 focus-visible:outline-none"
                aria-label={sector.name}
              >
                <div className="relative w-full aspect-[6/5] overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 ease-out group-hover:border-[#1f632b] group-hover:shadow-lg group-focus-visible:border-[#1f632b] group-focus-visible:shadow-lg [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0%_50%)]">
                  <div className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0%_50%)] bg-[conic-gradient(from_0deg,#1f632b,transparent_20%,#1f632b,transparent_55%,#1f632b)] animate-[spin_5s_linear_infinite] opacity-80" />
                  <div className="absolute inset-[2px] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0%_50%)] bg-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1f632b]/20 via-white to-[#1f632b]/10 transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105" />
                  <div className="relative h-full w-full flex flex-col items-center justify-center gap-2 transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 z-10">
                    {sector.imageUrl ? (
                      <div className="absolute inset-0">
                        <FirebaseImage
                          src={sector.imageUrl}
                          alt={sector.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 border border-gray-200 transition-transform duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110">
                        <Icon className="h-6 w-6 text-[#1f632b]" />
                      </div>
                    )}
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] rounded-full bg-black/55 px-3 py-1 text-[11px] md:text-xs font-semibold text-white text-center leading-tight line-clamp-2 transition-colors duration-300 group-hover:bg-[#1f632b]/80 group-focus-visible:bg-[#1f632b]/80">
                      {sector.name}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Бүтээгдэхүүний салбарын ангилал</h2>
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        {sectors.map((sector) => {
          const Icon = iconAssignments.get(sector.id) || resolveSectorIcon(sector);
          return (
            <Link
              key={sector.id}
              href={`/products?sector=${encodeURIComponent(sector.name)}`}
              className="group relative flex flex-col items-center"
              aria-label={sector.name}
            >
              <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm transition-all group-hover:border-[#1f632b] group-hover:shadow-md">
                <Icon className="h-6 w-6 md:h-7 md:w-7 text-[#1f632b]" />
              </div>
              <span className="pointer-events-none absolute -bottom-8 whitespace-nowrap rounded-full bg-[#1f632b] px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {sector.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
