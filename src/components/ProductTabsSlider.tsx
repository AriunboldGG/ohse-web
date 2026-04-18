"use client";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { getAllProducts, type Product as BackendProduct } from "@/lib/products";
import FirebaseImage from "@/components/FirebaseImage";
import Autoplay from "embla-carousel-autoplay";

function ProductsCarousel({ productsToShow }: { productsToShow: BackendProduct[] }) {
  if (productsToShow.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Бүтээгдэхүүн олдсонгүй
      </div>
    );
  }

  const shouldAutoplay = productsToShow.length > 4;
  const autoplayPlugin = useMemo(() => {
    if (!shouldAutoplay) return [];
    return [Autoplay({ delay: 3000, stopOnInteraction: false })];
  }, [shouldAutoplay]);

  return (
    <div className="relative">
      <Carousel
        className="w-full"
        opts={{ loop: shouldAutoplay }}
        plugins={autoplayPlugin}
      >
        <CarouselContent className="-ml-2 md:-ml-4 px-8 md:px-12">
          {productsToShow.map((p) => (
            <CarouselItem key={p.firestoreId || p.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Link href={`/products/${p.firestoreId || p.id}`} className="block h-full">
                <Card className="overflow-hidden hover:border-[#1f632b] transition-colors cursor-pointer h-full flex flex-col">
                  <CardContent className="p-4 flex flex-col gap-3 flex-1">
                    {/* Image */}
                    <div className="relative h-32 w-full">
                      {p.images && p.images.length > 0 ? (
                        <FirebaseImage
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-contain bg-white"
                        />
                      ) : p.img ? (
                        <FirebaseImage
                          src={p.img}
                          alt={p.name}
                          fill
                          className="object-contain bg-white"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Зураг байхгүй</span>
                        </div>
                      )}
                    </div>
                    {/* Title */}
                    <div className="min-h-[36px] space-y-0.5">
                      {p.name_en ? (
                        <>
                          <div className="text-xs text-gray-900 font-semibold line-clamp-1">{p.name_en}</div>
                          <div className="text-[10px] text-gray-600 line-clamp-1">{p.name}</div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-900 font-semibold line-clamp-2">{p.name}</div>
                      )}
                      {p.brand ? (
                        <div className="text-[10px] text-[#1f632b] font-semibold line-clamp-1">Brand: {p.brand}</div>
                      ) : null}
                    </div>
                    {/* Model Number */}
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium">Модел дугаар</div>
                      <div className="text-xs font-bold text-[#1f632b]">{p.modelNumber || "N/A"}</div>
                    </div>
                    {/* Price */}
                    <div className="mt-auto space-y-1">
                      {p.salePriceNum && p.salePriceNum > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-red-600">
                            {p.salePriceNum.toLocaleString()} ₮
                          </span>
                          <span className="text-xs text-gray-400 line-through">{p.price}</span>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-900">{p.price}</div>
                      )}
                      {p.manufacture_country ? (
                        <div className="text-[10px] text-gray-600">Үйлдвэрлэсэн улс: {p.manufacture_country}</div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 -translate-y-1/2 top-1/2 z-10 bg-white shadow-md hover:bg-gray-50" />
        <CarouselNext className="right-0 -translate-y-1/2 top-1/2 z-10 bg-white shadow-md hover:bg-gray-50" />
      </Carousel>
    </div>
  );
}

export default function ProductTabsSlider() {
  const [allProducts, setAllProducts] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const products = await getAllProducts();
        setAllProducts(products);
      } catch (error) {
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Extract unique productTypes from all products
  const productTypes = useMemo(() => {
    const typesSet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.productTypes && Array.isArray(product.productTypes)) {
        product.productTypes.forEach((type) => {
          if (type && typeof type === 'string' && type.trim() !== '') {
            typesSet.add(type.trim());
          }
        });
      }
    });
    return Array.from(typesSet).sort();
  }, [allProducts]);

  // Filter products by productType
  const getProductsByType = useMemo(() => {
    const map = new Map<string, BackendProduct[]>();
    productTypes.forEach((type) => {
      const filtered = allProducts.filter((product) => {
        return product.productTypes && product.productTypes.includes(type);
      });
      map.set(type, filtered.slice(0, 12)); // Limit to 12 per tab
    });
    return map;
  }, [allProducts, productTypes]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
        <div className="text-center py-8 text-gray-500">ачаалж байна...</div>
      </div>
    );
  }

  if (productTypes.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
        <div className="text-center py-8 text-gray-500">Бүтээгдэхүүний төрөл олдсонгүй</div>
      </div>
    );
  }

  const firstTabValue = productTypes[0]?.toLowerCase().replace(/\s+/g, '-') || '';

  return (
    <Tabs defaultValue={firstTabValue} className="w-full">
      <div className="rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="min-w-0 w-full overflow-x-auto sm:overflow-visible">
            <TabsList className="bg-transparent p-1 rounded-full border border-gray-200 inline-flex whitespace-nowrap gap-1">
              {productTypes.map((type) => {
                const tabValue = type.toLowerCase().replace(/\s+/g, '-');
                return (
                  <TabsTrigger
                    key={type}
                    value={tabValue}
                    className="rounded-full data-[state=active]:bg-[#1f632b] data-[state=active]:text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 cursor-pointer"
                  >
                    {type}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
       
        </div>
        {productTypes.map((type) => {
          const tabValue = type.toLowerCase().replace(/\s+/g, '-');
          const productsForTab = getProductsByType.get(type) || [];
          return (
            <TabsContent key={type} value={tabValue}>
              <ProductsCarousel productsToShow={productsForTab} />
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
}


