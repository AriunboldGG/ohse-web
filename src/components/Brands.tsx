"use client";

import Link from "next/link";
import { useEffect, useState, useRef, Fragment } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import FirebaseImage from "@/components/FirebaseImage";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";

interface BrandItem {
  id: string;
  title: string;
  image: string;
}

export default function Brands() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    async function fetchBrands() {
      setIsLoading(true);
      try {
        if (!db) return;
        const snapshot = await getDocs(collection(db, "brands"));
        const items: BrandItem[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.name || "",
              image: data.image || "",
            };
          })
          .filter((b) => b.title && b.image);
        items.sort((a, b) => a.title.localeCompare(b.title, "mn", { sensitivity: "base" }));
        setBrands(items);
      } catch {
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrands();
  }, []);

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
    <div className="bg-white px-4 py-4">
          <Carousel
            plugins={[plugin.current]}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {brands.map((brand, index) => (
                <Fragment key={brand.id}>
                  <CarouselItem className="pl-3 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
                    <Link
                      href={`/products?brand=${encodeURIComponent(brand.title)}`}
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
                  {index < brands.length - 1 && (
                    <div className="pl-3 flex items-center">
                      <Separator orientation="vertical" className="h-14 bg-[#1e0acf]/20 w-[1px]" />
                    </div>
                  )}
                </Fragment>
              ))}
            </CarouselContent>
          </Carousel>
    </div>
  );
}


