"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Shield, LifeBuoy, Wrench, Package } from "lucide-react";
import { getMainCategories, getAllProducts, type MainCategory } from "@/lib/products";

// Icon mapping for Lucide icons
const iconMap: Record<string, LucideIcon> = {
  Shield,
  LifeBuoy,
  Wrench,
  Package,
};

export default function TopCategories() {
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // First, try to fetch from main_categories collection
        const mainCats = await getMainCategories();
        
        if (mainCats.length > 0) {
          setCategories(mainCats);
        } else {
          // Fallback: extract categories from products
          const products = await getAllProducts();
          const uniqueMainCategories = new Set<string>();
          
          products.forEach(p => {
            if (p.mainCategory && typeof p.mainCategory === 'string' && p.mainCategory.trim() !== '') {
              uniqueMainCategories.add(p.mainCategory.trim());
            }
          });
          
          // Convert to MainCategory format
          const categoriesFromProducts: MainCategory[] = Array.from(uniqueMainCategories).map((name, index) => ({
            id: `product-${index}`,
            name: name,
            label: name, // Use name as label
            slug: name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
            order: index,
            icon: "Shield", // Default icon
          }));
          
          setCategories(categoriesFromProducts);
        }
      } catch (error) {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#1E293B] text-lg">Бүтээгдэхүүний ангилал</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">ачаалж байна...</div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#1E293B] text-lg">Бүтээгдэхүүний ангилал</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(() => {
          const other = categories.filter((c) => c.name?.trim() === "Бусад");
          const rest = categories.filter((c) => c.name?.trim() !== "Бусад");
          const ordered = [...rest, ...other];
          return ordered;
        })().map((c) => {
          const IconComponent = c.icon ? iconMap[c.icon] : Shield;
          const Icon = IconComponent || Shield;
          
          return (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.name)}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:border-[#1f632b] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1f632b]/10">
                  <Icon className="h-4 w-4 text-[#1f632b]" />
                </div>
                <span className="text-sm text-gray-700">{c.name}</span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}


