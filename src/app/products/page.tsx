"use client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import FirebaseImage from "@/components/FirebaseImage";
import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, LifeBuoy, Wrench, Package } from "lucide-react";
import { useStock } from "@/context/StockContext";
import { getAllProducts, getSubcategories, getSectors, type Product, type Subcategory, type Sector } from "@/lib/products";
import { log } from "console";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { setInitialStock, getStock } = useStock();
  const pageSize = 50;
  const [page, setPage] = useState(1);
  const [selectedCat, setSelectedCat] = useState<"all" | string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedLeaf, setSelectedLeaf] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<Array<"in_stock" | "preorder">>([]);
  const [selectedSale, setSelectedSale] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromFirestore, setIsFromFirestore] = useState(false);
  const [backendSubcategories, setBackendSubcategories] = useState<Subcategory[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const normalizeBrand = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*-\s*/g, "-");

  const brandOptions = useMemo(() => {
    const brandMap = new Map<string, string>();

    allProducts.forEach((product) => {
      if (product.brand && product.brand.trim() !== "") {
        const label = product.brand.trim();
        const key = normalizeBrand(label);
        if (!brandMap.has(key)) {
          brandMap.set(key, label);
        }
      }
    });

    return Array.from(brandMap.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "mn", { sensitivity: "base" }));
  }, [allProducts]);

  // Fetch products and subcategories from Firestore on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch products
        const products = await getAllProducts();
        if (products.length > 0) {
          setAllProducts(products);
          setIsFromFirestore(true);
        } else {
          setAllProducts([]);
          setIsFromFirestore(false);
        }

        // Fetch subcategories from backend
        const subcategories = await getSubcategories();
        if (subcategories.length > 0) {
          setBackendSubcategories(subcategories);
        } else {
          setBackendSubcategories([]);
        }
      } catch (error) {
        setAllProducts([]);
        setIsFromFirestore(false);
          setBackendSubcategories([]);
        }

      try {
        // Fetch sectors from backend (independent of products)
        const sectorsData = await getSectors();
        if (sectorsData.length > 0) {
          setSectors(sectorsData);
        } else {
          setSectors([]);
        }
      } catch (error) {
        setSectors([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extract unique mainCategory values from products (can be Mongolian text)
  const mainCategoriesFromProducts = useMemo(() => {
    const uniqueMainCategories = new Set<string>();
    allProducts.forEach(p => {
      // Check if product has mainCategory field (from Firestore)
      if (p.mainCategory && typeof p.mainCategory === 'string' && p.mainCategory.trim() !== '') {
        uniqueMainCategories.add(p.mainCategory.trim());
      }
    });
    
    // Convert to array and sort alphabetically A-Z, with "Бусад" always at the end
    const categoriesArray = Array.from(uniqueMainCategories);
    const bусадCategories = categoriesArray.filter(cat => cat === "Бусад");
    const otherCategories = categoriesArray.filter(cat => cat !== "Бусад");
    
    // Sort others alphabetically using localeCompare for proper Mongolian sorting
    otherCategories.sort((a, b) => a.localeCompare(b, 'mn', { sensitivity: 'base' }));
    
    // Return sorted array with "Бусад" at the end
    return [...otherCategories, ...bусадCategories];
  }, [allProducts]);

  // Initialize stock counts (using stock context, not from product data)


  // Read category, brand, and search from URL query params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && allProducts.length > 0) {
      // Check if category is valid (ppe, rescue, workplace, other) - legacy support
      const validCategories: Product["category"][] = ["ppe", "rescue", "workplace", "other"];
      if (validCategories.includes(categoryParam as Product["category"])) {
        setSelectedCat(categoryParam as Product["category"]);
        setPage(1);
        setSelectedSub(null);
        setSelectedLeaf([]);
      } else {
        // Decode the category parameter (it's URL encoded)
        const decodedCategory = decodeURIComponent(categoryParam);
        
        // Check if it's a mainCategory text from products (exact match)
        const mainCategories = Array.from(new Set(allProducts.map(p => p.mainCategory).filter(Boolean) as string[]));
        const matchedMainCategory = mainCategories.find(mc => 
          mc.trim() === decodedCategory.trim()
        );
        
        if (matchedMainCategory) {
          setSelectedCat(matchedMainCategory);
          setPage(1);
          setSelectedSub(null);
          setSelectedLeaf([]);
        } else {
          // Check if it's a category name (from category field in products)
          const allCategoryNames = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean) as string[]));
          const matchedCategory = allCategoryNames.find(cat => 
            cat.trim() === decodedCategory.trim()
          );
          
          if (matchedCategory) {
            // Find which mainCategory this category belongs to
            const productWithCategory = allProducts.find(p => p.category === matchedCategory);
            if (productWithCategory && productWithCategory.mainCategory) {
              setSelectedCat(productWithCategory.mainCategory);
              setSelectedCategory(matchedCategory);
              setPage(1);
              setSelectedSub(null);
              setSelectedLeaf([]);
            }
          } else {
            // Check if it's a subcategory name
            const allSubcategoryNames = Array.from(new Set(allProducts.map(p => p.subcategory).filter(Boolean) as string[]));
            const matchedSubcategory = allSubcategoryNames.find(sub => 
              sub.trim() === decodedCategory.trim()
            );
            
            if (matchedSubcategory) {
              // Find which mainCategory and category this subcategory belongs to
              const productWithSubcategory = allProducts.find(p => p.subcategory === matchedSubcategory);
              if (productWithSubcategory) {
                if (productWithSubcategory.mainCategory) {
                  setSelectedCat(productWithSubcategory.mainCategory);
                }
                if (productWithSubcategory.category) {
                  setSelectedCategory(productWithSubcategory.category);
                }
                setSelectedSub(matchedSubcategory);
                setPage(1);
                setSelectedLeaf([]);
              }
            }
          }
        }
      }
    }
    
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      const normalizedBrand = normalizeBrand(decodeURIComponent(brandParam));
      if (brandOptions.some((b) => b.key === normalizedBrand)) {
        setSelectedBrands([normalizedBrand]);
        setPage(1);
      }
    }

    const sectorParam = searchParams.get("sector");
    if (sectorParam && allProducts.length > 0) {
      const decodedSector = decodeURIComponent(sectorParam).trim();
      const allSectors = Array.from(
        new Set(
          allProducts
            .flatMap((p) => {
              if (Array.isArray(p.product_sector)) return p.product_sector;
              if (typeof p.product_sector === "string") {
                return p.product_sector.split(",").map((s) => s.trim());
              }
              return [];
            })
            .filter((s): s is string => !!s && s.trim() !== "")
            .map((s) => s.trim())
        )
      );
      const matchedSector = allSectors.find((s) => s === decodedSector);
      
      if (matchedSector) {
        setSelectedSectors([matchedSector]);
        setPage(1);
      }
    }

    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
      setPage(1);
    } else {
      setSearchQuery("");
    }

    const saleParam = searchParams.get("sale");
    if (saleParam !== null) {
      const normalized = saleParam.trim().toLowerCase();
      const isSaleSelected = normalized === "true" || normalized === "1" || normalized === "yes";
      setSelectedSale(isSaleSelected);
      if (isSaleSelected) {
        setPage(1);
      }
    }
  }, [searchParams, allProducts, brandOptions]);

  // Icon mapping for categories
  const categoryIcons: Record<Product["category"], typeof Shield | null> = {
    ppe: Shield,
    rescue: LifeBuoy,
    workplace: Wrench,
    other: Package,
  };

  // Category labels mapping
  const categoryLabels: Record<Product["category"], string> = {
    ppe: "ХАБ хувцас хэрэгсэл",
    rescue: "Аврах хамгаалах",
    workplace: "Ажлын байр",
    other: "Бусад",
  };

  // Build categories array for top filter bar - extract from products mainCategory field only
  const categories = useMemo(() => {
    const allCat = { id: "all" as const, label: "Бүгд", icon: null, count: allProducts.length };
    
    // Use mainCategories extracted from products (Mongolian text from Firebase)
    const categoryCats = mainCategoriesFromProducts.map(mainCatText => ({
      id: mainCatText, // Use the Mongolian text as ID
      label: mainCatText, // Display the Mongolian text directly
      icon: null, // No icon mapping for custom categories
      count: allProducts.filter(p => {
        // Filter by exact mainCategory match
        return p.mainCategory === mainCatText;
      }).length,
    }));
    
    return [allCat, ...categoryCats];
  }, [allProducts, mainCategoriesFromProducts]);

  // Categories (category field) from products - grouped by mainCategory
  const productCategories = useMemo(() => {
    const categoriesMap: Record<string, string[]> = {};
    
    // Extract unique category values from products, grouped by mainCategory
    allProducts.forEach(p => {
      if (p.mainCategory && p.category) {
        // Group by mainCategory
        if (!categoriesMap[p.mainCategory]) {
          categoriesMap[p.mainCategory] = [];
        }
        // Add category if it doesn't exist
        if (!categoriesMap[p.mainCategory]!.includes(p.category)) {
          categoriesMap[p.mainCategory]!.push(p.category);
        }
      }
    });
    
    return categoriesMap;
  }, [allProducts]);

  // Subcategories (subcategory field) from products - grouped by mainCategory and category
  const subcats = useMemo(() => {
    const subcatsMap: Record<string, Record<string, string[]>> = {};
    
    // Extract unique subcategory values from products, grouped by mainCategory and category
    allProducts.forEach(p => {
      if (p.mainCategory && p.category && p.subcategory) {
        // Initialize mainCategory if it doesn't exist
        if (!subcatsMap[p.mainCategory]) {
          subcatsMap[p.mainCategory] = {};
        }
        // Initialize category array if it doesn't exist
        if (!subcatsMap[p.mainCategory]![p.category]) {
          subcatsMap[p.mainCategory]![p.category] = [];
        }
        // Add subcategory if it doesn't exist
        if (!subcatsMap[p.mainCategory]![p.category].includes(p.subcategory)) {
          subcatsMap[p.mainCategory]![p.category].push(p.subcategory);
        }
      }
    });
    
    return subcatsMap;
  }, [allProducts]);

  // Subleaf (subleaf field) from products - grouped by mainCategory, category, and subcategory
  const leafcats = useMemo(() => {
    const leafcatsMap: Record<string, Record<string, Record<string, string[]>>> = {};
    
    // Extract unique subleaf values from products for each mainCategory, category, and subcategory combination
    allProducts.forEach(p => {
      if (p.mainCategory && p.category && p.subcategory && p.subleaf) {
        // Initialize mainCategory if it doesn't exist
        if (!leafcatsMap[p.mainCategory]) {
          leafcatsMap[p.mainCategory] = {};
        }
        // Initialize category if it doesn't exist
        if (!leafcatsMap[p.mainCategory]![p.category]) {
          leafcatsMap[p.mainCategory]![p.category] = {};
        }
        // Initialize subcategory array if it doesn't exist
        if (!leafcatsMap[p.mainCategory]![p.category]![p.subcategory]) {
          leafcatsMap[p.mainCategory]![p.category]![p.subcategory] = [];
        }
        // Add subleaf if it doesn't exist
        if (!leafcatsMap[p.mainCategory]![p.category]![p.subcategory].includes(p.subleaf)) {
          leafcatsMap[p.mainCategory]![p.category]![p.subcategory].push(p.subleaf);
        }
      }
    });
    
    return leafcatsMap;
  }, [allProducts]);

  // Helper function to parse comma-separated values into array
  const parseCommaSeparated = (value: any): string[] => {
    if (!value) return [];
    // Convert to string and trim
    const str = String(value).trim();
    if (!str) return [];
    // Split by comma and filter out empty values
    return str.split(',').map(s => s.trim()).filter(s => s && s.length > 0);
  };

  // Helper function to format and display sizes/colors nicely
  const formatDisplayValue = (value: string | undefined | null, isSize: boolean = false): string[] => {
    if (!value) return [];
    const str = String(value).trim();
    if (!str) return [];
    
    // First try to split by comma
    const commaSeparated = str.split(',').map(s => s.trim()).filter(s => s && s.length > 0);
    if (commaSeparated.length > 1) {
      return commaSeparated;
    }
    
    // For sizes, try to detect concatenated sizes (like "MLXL" -> ["M", "L", "XL"])
    if (isSize) {
      // Common size patterns: XS, XXS, XXXS, S, M, L, XL, XXL, XXXL, or numeric sizes
      const sizePattern = /(XXX?S|XXX?L|XX?S|XX?L|XS|XL|[SM]|\d+)/gi;
      const matches = str.match(sizePattern);
      if (matches && matches.length > 1) {
        return matches;
      }
    }
    
    // Otherwise return as single value
    return [str];
  };

  // Helper function to capitalize first letter for display
  const capitalizeFirst = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  // Helper function to check if a product's size contains any selected value
  const productHasSize = (product: Product, selectedSizes: string[]): boolean => {
    if (selectedSizes.length === 0) return true;
    if (!product.size) return false;
    
    // Parse product sizes (handles both single values and comma-separated)
    const productSizes = parseCommaSeparated(product.size).map(s => s.trim().toLowerCase());
    const normalizedSelectedSizes = selectedSizes.map(s => s.trim().toLowerCase());
    
    // Check if any of the product's sizes match any selected size
    return productSizes.some(size => normalizedSelectedSizes.includes(size));
  };

  // Helper function to check if a product's color contains any selected value
  const productHasColor = (product: Product, selectedColors: string[]): boolean => {
    if (selectedColors.length === 0) return true;
    if (!product.color) return false;
    
    // Parse product colors (handles both single values and comma-separated)
    const productColors = parseCommaSeparated(product.color).map(c => c.trim().toLowerCase());
    const normalizedSelectedColors = selectedColors.map(c => c.trim().toLowerCase());
    
    // Check if any of the product's colors match any selected color
    return productColors.some(color => normalizedSelectedColors.includes(color));
  };
  const filtered = useMemo(() => {
    if (allProducts.length === 0) return [];
    
    // Filter by mainCategory field from products (Mongolian text)
    let base = selectedCat === "all" 
      ? allProducts 
      : allProducts.filter(p => {
          // Filter by exact mainCategory match (Mongolian text from Firebase)
          return p.mainCategory === selectedCat;
        });
    
    if (selectedCat !== "all" && selectedCategory) {
      base = base.filter(p => p.category === selectedCategory);
    }
    if (selectedCat !== "all" && selectedCategory && selectedSub) {
      base = base.filter(p => p.subcategory === selectedSub);
    }
    if (selectedCat !== "all" && selectedCategory && selectedSub && selectedLeaf.length) {
      base = base.filter(p => selectedLeaf.includes(p.subleaf));
    }
    if (selectedColors.length) base = base.filter(p => productHasColor(p, selectedColors));
    if (selectedBrands.length) {
      base = base.filter((p) => {
        if (!p.brand) return false;
        return selectedBrands.includes(normalizeBrand(p.brand));
      });
    }
    if (selectedSizes.length) base = base.filter(p => productHasSize(p, selectedSizes));
    if (selectedThemes.length) base = base.filter(p => selectedThemes.includes(p.theme));
    if (selectedSectors.length) {
      base = base.filter((p) => {
        if (!p.product_sector) return false;
        const productSectors = Array.isArray(p.product_sector)
          ? p.product_sector
          : typeof p.product_sector === "string"
            ? p.product_sector.split(",").map((s) => s.trim())
            : [];
        return productSectors.some((sector) =>
          selectedSectors.includes(sector)
        );
      });
    }
    if (selectedStock.length) {
      base = base.filter(p => {
        const stockStatus: "in_stock" | "preorder" = p.stock > 0 ? "in_stock" : "preorder";
        return selectedStock.includes(stockStatus);
      });
    }
    if (selectedSale) {
      base = base.filter((p) => {
        if (p.sale === true) return true;
        if (Array.isArray(p.productTypes)) {
          return p.productTypes.some((type) => String(type).trim().toUpperCase() === "DISCOUNTED");
        }
        return false;
      });
    }
    // Filter by search query (product name)
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.trim().toLowerCase();
      base = base.filter(p => {
        const productName = (p.name || "").toLowerCase();
        return productName.includes(query);
      });
    }
    return base;
  }, [allProducts, selectedCat, selectedCategory, selectedSub, selectedLeaf, selectedColors, selectedBrands, selectedSizes, selectedThemes, selectedSectors, selectedStock, selectedSale, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [page, filtered]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">ачаалж байна...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">БҮТЭЭГДЭХҮҮН</h1>
           
          </div>
        </div>

        {/* Top category filter bar */}
        <div className="mb-4 sm:mb-6 rounded-xl border border-gray-200 bg-white p-2 sm:p-3 shadow-sm overflow-x-auto">
          <div className="flex flex-wrap gap-2 sm:gap-3 min-w-max sm:min-w-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCat(c.id);
                  setPage(1);
                  setSelectedCategory(null);
                  setSelectedSub(null);
                  setSelectedLeaf([]);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm transition-colors ${
                  selectedCat === c.id
                    ? "border-[#1f632b] bg-[#1f632b] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#1f632b] hover:bg-[#1f632b]/10"
                }`}
              >
                {c.icon ? (
                  typeof c.icon === 'function' ? (
                    React.createElement(c.icon as React.ComponentType<{ className?: string }>, { className: "h-4 w-4" })
                  ) : null
                ) : null}
                <span>{c.label}</span>
                <span className="ml-1 text-[10px] opacity-80">{c.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile filters toggle */}
        <div className="mb-4 md:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[#1f632b]/10 hover:text-[#1f632b] hover:border-[#1f632b] transition-colors"
          >
            Шүүлтүүрүүд
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 sm:gap-6">
          {/* Left filters: show categories first, then subcategories when category is selected */}
          <aside className="hidden lg:block space-y-4">
            {/* Categories (category field) - shown when main category is selected */}
            {selectedCat !== "all" && productCategories[selectedCat] ? (
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">Ангилал</div>
                <div className="space-y-2">
                  {productCategories[selectedCat]!.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat === selectedCategory ? null : cat);
                        setSelectedSub(null);
                        setSelectedLeaf([]);
                        setPage(1);
                      }}
                      className={`w-full text-left rounded-md px-2 py-2 text-sm transition-colors ${
                        cat === selectedCategory ? "bg-[#1f632b]/10 text-[#1f632b]" : "hover:bg-[#1f632b]/10 hover:text-[#1f632b]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Subcategories (subcategory field) - shown when a category is selected */}
            {selectedCat !== "all" && selectedCategory && subcats[selectedCat] && subcats[selectedCat]![selectedCategory] ? (
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">Дэд ангилал</div>
                <div className="space-y-2">
                  {subcats[selectedCat]![selectedCategory]!.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSub(sub === selectedSub ? null : sub);
                        setSelectedLeaf([]);
                        setPage(1);
                      }}
                      className={`w-full text-left rounded-md px-2 py-2 text-sm transition-colors ${
                        sub === selectedSub ? "bg-[#1f632b]/10 text-[#1f632b]" : "hover:bg-[#1f632b]/10 hover:text-[#1f632b]"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Subleaf (subleaf field) - shown when a subcategory is selected */}
            {selectedCat !== "all" && selectedCategory && selectedSub && leafcats[selectedCat] && leafcats[selectedCat]![selectedCategory] && leafcats[selectedCat]![selectedCategory]![selectedSub] ? (
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">Нарийвчилсан ангилал</div>
                <div className="space-y-2 text-sm">
                  {leafcats[selectedCat]![selectedCategory]![selectedSub]!.map((leaf) => (
                    <label key={leaf} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedLeaf.includes(leaf)}
                        onChange={(e) => {
                          setPage(1);
                          setSelectedLeaf((prev) =>
                            e.target.checked ? [...prev, leaf] : prev.filter((x) => x !== leaf)
                          );
                        }}
                      />
                      {leaf}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Brand filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="text-sm font-semibold text-gray-800 mb-2">Брэнд</div>
              <div className="space-y-2 text-sm">
                {brandOptions.map((b) => {
                  const checked = selectedBrands.includes(b.key);
                  return (
                    <label key={b.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setPage(1);
                          setSelectedBrands((prev) =>
                            e.target.checked
                              ? [...prev, b.key]
                              : prev.filter((x) => x !== b.key)
                          );
                        }}
                      />
                      {b.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Product Sector filter */}
            {(() => {
              // Extract sectors from products (supports array and comma-separated string)
              let productSectors: string[] = [];
              
              productSectors = Array.from(
                new Set(
                  allProducts
                    .flatMap((p) => {
                      if (Array.isArray(p.product_sector)) return p.product_sector;
                      if (typeof p.product_sector === "string") {
                        return p.product_sector.split(",").map((s) => s.trim());
                      }
                      return [];
                    })
                    .filter((s): s is string => !!s && s.trim() !== "")
                    .map((s) => s.trim())
                )
              ).sort();
              
              // Always show the filter section, even if empty
              return (
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Бүтээгдэхүүний салбар</div>
                  <div className="space-y-2 text-sm">
                    {productSectors.length > 0 ? (
                      productSectors.map((sectorName) => {
                        const checked = selectedSectors.includes(sectorName);
                        return (
                          <label key={sectorName} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setPage(1);
                                setSelectedSectors((prev) =>
                                  e.target.checked ? [...prev, sectorName] : prev.filter((x) => x !== sectorName)
                                );
                              }}
                            />
                            {sectorName}
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-400">Салбар олдсонгүй</div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Stock Status filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="text-sm font-semibold text-gray-800 mb-2">Төлөв</div>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStock.includes("in_stock")}
                    onChange={(e) => {
                      setPage(1);
                      setSelectedStock((prev) =>
                        e.target.checked ? [...prev, "in_stock"] : prev.filter((x) => x !== "in_stock")
                      );
                    }}
                  />
                  <span className="text-black font-medium">Бэлэн байгаа</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStock.includes("preorder")}
                    onChange={(e) => {
                      setPage(1);
                      setSelectedStock((prev) =>
                        e.target.checked ? [...prev, "preorder"] : prev.filter((x) => x !== "preorder")
                      );
                    }}
                  />
                  <span className="text-black font-medium">Захиалгаар</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSale}
                    onChange={(e) => {
                      setPage(1);
                      setSelectedSale(e.target.checked);
                    }}
                  />
                  <span className="text-black font-medium">Хямдралтай</span>
                </label>
              </div>
            </div>

            {/* Clear filters */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSub(null);
                setSelectedLeaf([]);
                setSelectedColors([]);
                setSelectedBrands([]);
                setSelectedSizes([]);
                setSelectedThemes([]);
                setSelectedSectors([]);
                setSelectedStock([]);
                setSelectedSale(false);
                setPage(1);
              }}
              className="w-full rounded-md border px-3 py-2 text-sm hover:bg-[#1f632b]/10 hover:text-[#1f632b] hover:border-[#1f632b] transition-colors"
            >
              Шүүлтүүр цэвэрлэх
            </button>
          </aside>

          {/* Products grid */}
          {allProducts.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg mb-2">Бүтээгдэхүүн олдсонгүй</p>
              <p className="text-gray-500 text-sm">Firestore-д бүтээгдэхүүн нэмнэ үү</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {pageItems.map((p) => (
            <Card key={p.firestoreId || `product-${p.id}`} className="group overflow-visible md:overflow-hidden lg:overflow-visible flex flex-col h-auto md:h-[80vh] lg:h-auto relative cursor-pointer hover:border-[#1f632b] hover:shadow-lg transition-all">
              <Link href={`/products/${p.firestoreId || p.id}`} aria-label={`View ${p.name}`} className="absolute inset-0 z-[1]"></Link>
              <div className="relative w-full flex-shrink-0 h-[200px]" style={{ paddingTop: 0 }}>
                <FirebaseImage
                  src={p.images && p.images.length > 0 ? p.images[0] : p.img}
                  alt={p.name}
                  fill
                  className="object-contain bg-gray-50"
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
                <Link
                  href={`/products/${p.firestoreId || p.id}`}
                  className="absolute bottom-2 right-2 z-[2] opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-[#1f632b] hover:bg-[#16451e] text-white text-xs px-3 py-1.5 shadow-md"
                >
                  Харах
                </Link>
              </div>
              <CardContent className="p-3 md:p-4 flex flex-col overflow-visible flex-1">
                  <div className="mb-2 space-y-1">
                    {p.name_en && p.name_en.trim() !== "" ? (
                      <>
                        <div className="text-sm md:text-base font-bold text-gray-900 leading-snug">{p.name_en}</div>
                        <div className="text-xs md:text-sm text-gray-700 leading-snug">{p.name}</div>
                      </>
                    ) : (
                      <div className="text-sm md:text-base font-bold text-gray-900 leading-snug">{p.name}</div>
                    )}
                  </div>
                  {p.brand && (
                    <div className="mb-2 inline-flex flex-col rounded-lg bg-[#EAF5EB] px-3 py-2">
                      <div className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">Брэнд</div>
                      <div className="text-xs md:text-sm font-bold text-[#1f632b] leading-tight">{p.brand}</div>
                    </div>
                  )}
                  <div className="mb-2">
                    <div className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">Модел дугаар</div>
                    <div className="text-xs md:text-sm font-bold text-[#1f632b] leading-tight">{p.modelNumber || "N/A"}</div>
                  </div>
                  {p.product_code && (
                    <div className="mb-2">
                      <div className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">Барааны код</div>
                      <div className="text-xs md:text-sm font-bold text-[#1f632b] leading-tight">{p.product_code}</div>
                    </div>
                  )}
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm overflow-visible flex-1">
                    {(p.priceNum > 0 || (p.price && p.price.trim() !== "" && p.price !== "0₮")) && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Үнэ:</span>
                        <span className="text-gray-600 break-words">
                          {p.salePriceNum && p.salePriceNum > 0 ? (
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-red-600">
                                {`${p.salePriceNum.toLocaleString()} ₮`}
                              </span>
                              <span className="text-gray-400 line-through">
                          {p.priceNum > 0 ? `${p.priceNum.toLocaleString()} ₮` : (p.price || "0₮")}
                              </span>
                            </span>
                          ) : (
                            <span>{p.priceNum > 0 ? `${p.priceNum.toLocaleString()} ₮` : (p.price || "0₮")}</span>
                          )}
                        </span>
                      </div>
                    )}
                    {p.manufacture_country ? (
                    <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Үйлдвэрлэсэн улс:</span>
                        <span className="text-gray-600 break-words capitalize">{p.manufacture_country}</span>
                    </div>
                    ) : null}
                    {p.color && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Өнгө:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {formatDisplayValue(p.color, false).map((color, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {capitalizeFirst(color)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {p.size && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Хэмжээ:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {formatDisplayValue(p.size, true).map((size, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {size.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {p.theme && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Загвар:</span>
                        <span className="text-gray-600 break-words">{p.theme}</span>
                      </div>
                    )}
                    {p.material && (
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Материал:</span>
                        <span className="text-gray-600 break-words whitespace-normal flex-1 min-w-0">{p.material}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[70px] md:min-w-[80px] flex-shrink-0">Нөөц:</span>
                      <span className={`font-semibold ${p.stock > 0 ? "text-green-600" : "text-orange-600"}`}>
                        {p.stock > 0 ? "Бэлэн байгаа" : "Захиалгаар"}
                      </span>
                    </div>
                  </div>
              </CardContent>
            </Card>
          ))}
          </div>
          )}
        </div>

        {/* Mobile filters bottom sheet */}
        {showMobileFilters && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowMobileFilters(false);
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 max-h-[80%] overflow-y-auto rounded-t-2xl bg-white p-4 space-y-4">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-300" />

              {/* Categories (category field) - shown when main category is selected */}
              {selectedCat !== "all" && productCategories[selectedCat] ? (
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Ангилал</div>
                  <div className="space-y-2">
                    {productCategories[selectedCat]!.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat === selectedCategory ? null : cat);
                          setSelectedSub(null);
                          setSelectedLeaf([]);
                          setPage(1);
                        }}
                        className={`w-full text-left rounded-md px-2 py-2 text-sm transition-colors ${
                          cat === selectedCategory ? "bg-[#1f632b]/10 text-[#1f632b]" : "hover:bg-[#1f632b]/10 hover:text-[#1f632b]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Subcategories (subcategory field) - shown when a category is selected */}
              {selectedCat !== "all" && selectedCategory && subcats[selectedCat] && subcats[selectedCat]![selectedCategory] ? (
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Дэд ангилал</div>
                  <div className="space-y-2">
                    {subcats[selectedCat]![selectedCategory]!.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSub(sub === selectedSub ? null : sub);
                          setSelectedLeaf([]);
                          setPage(1);
                        }}
                        className={`w-full text-left rounded-md px-2 py-2 text-sm transition-colors ${
                          sub === selectedSub ? "bg-[#1f632b]/10 text-[#1f632b]" : "hover:bg-[#1f632b]/10 hover:text-[#1f632b]"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Subleaf (subleaf field) - shown when a subcategory is selected */}
              {selectedCat !== "all" && selectedCategory && selectedSub && leafcats[selectedCat] && leafcats[selectedCat]![selectedCategory] && leafcats[selectedCat]![selectedCategory]![selectedSub] ? (
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Нарийвчилсан ангилал</div>
                  <div className="space-y-2 text-sm">
                    {leafcats[selectedCat]![selectedCategory]![selectedSub]!.map((leaf) => (
                      <label key={leaf} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedLeaf.includes(leaf)}
                          onChange={(e) => {
                            setPage(1);
                            setSelectedLeaf((prev) =>
                              e.target.checked ? [...prev, leaf] : prev.filter((x) => x !== leaf)
                            );
                          }}
                        />
                        {leaf}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Brand */}
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">Брэнд</div>
                <div className="space-y-2 text-sm">
                  {brandOptions.map((b) => {
                    const checked = selectedBrands.includes(b.key);
                    return (
                      <label key={b.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setPage(1);
                            setSelectedBrands((prev) =>
                              e.target.checked
                                ? [...prev, b.key]
                                : prev.filter((x) => x !== b.key)
                            );
                          }}
                        />
                        {b.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Product Sector filter */}
              {(() => {
                // Extract sectors from products (supports array and comma-separated string)
                let productSectors: string[] = [];
                
                productSectors = Array.from(
                  new Set(
                    allProducts
                      .flatMap((p) => {
                        if (Array.isArray(p.product_sector)) return p.product_sector;
                        if (typeof p.product_sector === "string") {
                          return p.product_sector.split(",").map((s) => s.trim());
                        }
                        return [];
                      })
                      .filter((s): s is string => !!s && s.trim() !== "")
                      .map((s) => s.trim())
                  )
                ).sort();
                
                // Always show the filter section, even if empty
                return (
                  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="text-sm font-semibold text-gray-800 mb-2">Бүтээгдэхүүний салбар</div>
                    <div className="space-y-2 text-sm">
                      {productSectors.length > 0 ? (
                        productSectors.map((sectorName) => {
                          const checked = selectedSectors.includes(sectorName);
                          return (
                            <label key={sectorName} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setPage(1);
                                  setSelectedSectors((prev) =>
                                    e.target.checked ? [...prev, sectorName] : prev.filter((x) => x !== sectorName)
                                  );
                                }}
                              />
                              {sectorName}
                            </label>
                          );
                        })
                      ) : (
                        <div className="text-xs text-gray-400">Салбар олдсонгүй</div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Theme */}
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">Загвар (Theme)</div>
                <div className="space-y-2 text-sm">
                  {Array.from(new Set(allProducts.map((p) => p.theme))).map((t) => {
                    const checked = selectedThemes.includes(t);
                    return (
                      <label key={t} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setPage(1);
                            setSelectedThemes((prev) =>
                              e.target.checked ? [...prev, t] : prev.filter((x) => x !== t)
                            );
                          }}
                        />
                        {t}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Stock Status filter */}
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">Нөөц</div>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStock.includes("in_stock")}
                      onChange={(e) => {
                        setPage(1);
                        setSelectedStock((prev) =>
                          e.target.checked ? [...prev, "in_stock"] : prev.filter((x) => x !== "in_stock")
                        );
                      }}
                    />
                    <span className="text-black font-medium">Бэлэн байгаа</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStock.includes("preorder")}
                      onChange={(e) => {
                        setPage(1);
                        setSelectedStock((prev) =>
                          e.target.checked ? [...prev, "preorder"] : prev.filter((x) => x !== "preorder")
                        );
                      }}
                    />
                    <span className="text-black font-medium">Захиалгаар</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSale}
                      onChange={(e) => {
                        setPage(1);
                        setSelectedSale(e.target.checked);
                      }}
                    />
                    <span className="text-black font-medium">Sale</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSub(null);
                    setSelectedLeaf([]);
                    setSelectedColors([]);
                    setSelectedBrands([]);
                    setSelectedSizes([]);
                    setSelectedThemes([]);
                    setSelectedSectors([]);
                    setSelectedStock([]);
                setSelectedSale(false);
                    setPage(1);
                  }}
                  className="w-full rounded-md border px-4 py-2 text-sm hover:bg-[#1f632b]/10 hover:text-[#1f632b] hover:border-[#1f632b] transition-colors"
                >
                  Цэвэрлэх
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full rounded-md border px-4 py-2 text-sm hover:bg-[#1f632b]/10 hover:text-[#1f632b] hover:border-[#1f632b] transition-colors"
                >
                  Хаах
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full rounded-md bg-[#1f632b] hover:bg-[#16451e] px-4 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  Хэрэглэх
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50 hover:bg-[#1f632b]/10 hover:text-[#1f632b] hover:border-[#1f632b] transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Өмнөх
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50 hover:bg-[#1f632b]/10 hover:text-[#1f632b] hover:border-[#1f632b] transition-colors"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Дараах
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">ачаалж байна...</div>
        </div>
      </main>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}