"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { getAllProducts, type Product } from "@/lib/products";
import FirebaseImage from "@/components/FirebaseImage";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface BrandItem {
  id: string;
  title: string;
  image: string;
  count: number;
}

export default function Brands() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const products = await getAllProducts();
        setAllProducts(products);
      } catch {
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    const brandMap = new Map<string, Product[]>();

    allProducts.forEach((product) => {
      if (product.brand && typeof product.brand === "string" && product.brand.trim() !== "") {
        const brandName = product.brand.trim();
        if (!brandMap.has(brandName)) brandMap.set(brandName, []);
        brandMap.get(brandName)!.push(product);
      }
    });

    const brandItems: BrandItem[] = Array.from(brandMap.entries()).map(
      ([brandName, products]) => {
        let brandImage = "";
        const withBrandImg = products.find((p) => p.brandImage && p.brandImage.trim() !== "");
        if (withBrandImg?.brandImage) {
          brandImage = withBrandImg.brandImage;
        } else if (products.length > 0) {
          const first = products[0];
          brandImage = first.images?.length ? first.images[0] : first.img || "";
        }
        return { id: brandName, title: brandName, image: brandImage, count: products.length };
      }
    );

    brandItems.sort((a, b) => {
      const aL = a.title.toLowerCase();
      const bL = b.title.toLowerCase();
      if (aL.includes("бусад") || aL.includes("other")) return 1;
      if (bL.includes("бусад") || bL.includes("other")) return -1;
      return a.title.localeCompare(b.title, "mn", { sensitivity: "base" });
    });

    return brandItems.filter((b) => b.image && b.image.trim() !== "");
  }, [allProducts]);

  if (isLoading) {
    return (
      <div className="h-28 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center text-sm text-gray-400">
        ачаалж байна...
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="h-28 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center text-sm text-gray-400">
        Брэнд олдсонгүй
      </div>
    );
  }

  return (
    <div className="relative rounded-xl p-[1px] overflow-hidden bg-gradient-to-r from-red-500 via-yellow-400 to-[#1e0acf]">
      <div className="rounded-xl bg-white px-4 py-4">
        <Carousel
          plugins={[plugin.current]}
          opts={{ loop: true, align: "start" }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {brands.map((brand) => (
              <CarouselItem
                key={brand.id}
                className="pl-3 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8"
              >
                <Link
                  href={`/products?brand=${encodeURIComponent(brand.id)}`}
                  className="block group"
                >
                  <div className="relative h-20 md:h-24 w-full rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-[#1e0acf] hover:shadow-md transition-all cursor-pointer">
                    <FirebaseImage
                      src={brand.image}
                      alt={brand.title}
                      fill
                      className="object-contain p-2 md:p-3 group-hover:scale-105 transition-transform"
                      sizes="(min-width: 1280px) 120px, (min-width: 768px) 160px, 128px"
                    />
                  </div>
                  <p className="mt-1 text-center text-[11px] text-gray-500 truncate group-hover:text-[#1e0acf] transition-colors">
                    {brand.title}
                  </p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}


