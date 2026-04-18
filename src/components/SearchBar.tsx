"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, LifeBuoy, Wrench, Package, type LucideIcon } from "lucide-react";
import { getCategoryTree, type CategoryTreeNode } from "@/lib/products";

export default function SearchBar() {
  const router = useRouter();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);
  const [hoveredSub, setHoveredSub] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Icon mapping for Lucide icons
  const iconMap: Record<string, LucideIcon> = {
    Shield,
    LifeBuoy,
    Wrench,
    Package,
  };

  // Fetch categories from backend on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);
        const tree = await getCategoryTree();
        setCategoryTree(tree);
      } catch (error) {
        setCategoryTree([]);
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        // Reset to default on desktop
        setHoveredCat(0);
        setHoveredSub(null);
      } else {
        // Reset to show categories on mobile
        setHoveredCat(null);
        setHoveredSub(null);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }

    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen]);

  // Keep selection unchanged until user clicks a category

  // Handle search
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      // If no search query, just go to products page
      router.push("/products");
    }
  };

  const navigateToCategory = (name: string) => {
    router.push(`/products?category=${encodeURIComponent(name)}`);
    setIsCategoryOpen(false);
  };

  return (
    <div className="w-full">
      <div className="bg-[#1f632b] rounded-xl px-4 md:px-5 py-4 md:py-5 shadow-md">
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg h-12 md:h-14 border-2 border-white/20 focus-within:border-white/40 transition-all">
            {/* Category Dropdown */}
            <button
              onClick={() => {
                const newState = !isCategoryOpen;
                setIsCategoryOpen(newState);
                if (newState) {
                  // Default to first category when opening
                  setHoveredCat(0);
                  setHoveredSub(null);
                }
              }}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 border-r border-gray-200 transition-all h-full cursor-pointer ${
                isCategoryOpen 
                  ? "bg-[#1f632b]/10 text-[#1f632b]" 
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="text-gray-700 font-medium text-sm md:text-base whitespace-nowrap">Ангилал</span>
              <svg
                className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Search Input Field */}
            <input
              type="text"
              placeholder="Бүтээгдэхүүн нэрээр хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="flex-1 px-4 md:px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none text-sm md:text-base h-full"
            />

            {/* Search Icon Button */}
            <button 
              onClick={handleSearch}
              className="px-4 md:px-5 py-3 border-l border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center h-full cursor-pointer group"
            >
              <svg
                className="w-5 h-5 text-[#1f632b] group-hover:text-[#1f632b] group-hover:scale-110 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Category Dropdown Menu with sub and sub-sub */}
          {isCategoryOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-full md:w-[640px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] md:max-h-none overflow-y-auto md:overflow-y-visible"
            >
              {isLoadingCategories ? (
                <div className="py-4 px-4 text-sm text-gray-500">ачаалж байна...</div>
              ) : categoryTree.length === 0 ? (
                <div className="py-4 px-4 text-sm text-gray-500">Ангилал олдсонгүй</div>
              ) : (
                <div className="flex flex-col gap-2 p-4 md:p-6">
                  {categoryTree.map((cat, index) => {
                    const isActive = hoveredCat === index;
                    const hasChildren = !!cat.children?.length;
                    return (
                      <div key={cat.slug} className="border-b border-gray-100 pb-2">
                        <div className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm md:text-base text-black hover:bg-gray-50 whitespace-normal uppercase">
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => {
                                setHoveredCat(isActive ? null : index);
                                setHoveredSub(null);
                              }}
                              className="flex-1 break-words leading-5 cursor-pointer text-left"
                            >
                              {cat.name}
                            </button>
                          ) : (
                            <Link
                              href={`/products?category=${encodeURIComponent(cat.name)}`}
                              onClick={() => navigateToCategory(cat.name)}
                              className="flex-1 break-words leading-5 cursor-pointer"
                            >
                              {cat.name}
                            </Link>
                          )}
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => {
                                setHoveredCat(isActive ? null : index);
                                setHoveredSub(null);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-[#1f632b] transition-colors cursor-pointer"
                              aria-label={`${cat.name} дэлгэрэнгүй`}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  isActive ? "rotate-90" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ) : null}
                        </div>

                        {isActive && hasChildren ? (
                          <div className="ml-4 mt-1 flex flex-col gap-1">
                            {cat.children!.map((sub, subIndex) => {
                              const subActive = hoveredSub === subIndex;
                              const subHasChildren = !!sub.children?.length;
                              return (
                                <div key={sub.slug} className="flex flex-col">
                                  <div className="flex items-start justify-between gap-2 rounded-md px-3 py-2 text-sm text-black hover:bg-gray-50 whitespace-normal uppercase">
                                    {subHasChildren ? (
                                      <button
                                        type="button"
                                        onClick={() => setHoveredSub(subActive ? null : subIndex)}
                                        className="flex-1 break-words leading-5 cursor-pointer text-left"
                                      >
                                        {sub.name}
                                      </button>
                                    ) : (
                                      <Link
                                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                                        onClick={() => navigateToCategory(cat.name)}
                                        className="flex-1 break-words leading-5 cursor-pointer"
                                      >
                                        {sub.name}
                                      </Link>
                                    )}
                                    {subHasChildren ? (
                                      <button
                                        type="button"
                                        onClick={() => setHoveredSub(subActive ? null : subIndex)}
                                        className="p-1 rounded-md text-gray-400 hover:text-[#1f632b] transition-colors cursor-pointer"
                                        aria-label={`${sub.name} дэлгэрэнгүй`}
                                      >
                                        <svg
                                          className={`w-4 h-4 transition-transform ${
                                            subActive ? "rotate-90" : ""
                                          }`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                    ) : null}
                                  </div>

                                  {subActive && subHasChildren ? (
                                    <div className="ml-4 mt-1 flex flex-col gap-1">
                                      {sub.children!.map((leaf) => (
                                        <Link
                                          key={leaf.slug}
                                          href={`/products?category=${encodeURIComponent(cat.name)}`}
                                          className="rounded-md px-3 py-2 text-xs text-black hover:bg-gray-50 hover:text-[#1f632b] whitespace-normal break-words leading-5 cursor-pointer uppercase"
                                          onClick={() => navigateToCategory(cat.name)}
                                        >
                                          {leaf.name}
                                        </Link>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

