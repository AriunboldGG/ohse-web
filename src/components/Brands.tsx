"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { getAllProducts, type Product } from "@/lib/products";
import FirebaseImage from "@/components/FirebaseImage";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

interface BrandItem {
  id: string;
  title: string;
  image: string;
  count: number;
}

export default function Brands() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products on mount
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

  // Extract brands from products with counts and images
  const brands = useMemo(() => {
    // Group products by brand
    const brandMap = new Map<string, Product[]>();
    
    allProducts.forEach((product) => {
      if (product.brand && typeof product.brand === 'string' && product.brand.trim() !== '') {
        const brandName = product.brand.trim();
        
        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, []);
        }
        
        brandMap.get(brandName)!.push(product);
      }
    });

    // Convert to BrandItem array - get image from brandImage field or first product's image
    const brandItems: BrandItem[] = Array.from(brandMap.entries()).map(([brandName, products]) => {
      // Try to get brandImage from products (prefer brandImage field, fallback to first product image)
      let brandImage = '';
      
      // First, try to find a product with brandImage field
      const productWithBrandImage = products.find(p => p.brandImage && p.brandImage.trim() !== '');
      if (productWithBrandImage && productWithBrandImage.brandImage) {
        brandImage = productWithBrandImage.brandImage;
      } else if (products.length > 0) {
        // Fallback to first product's first image or main image
        const firstProduct = products[0];
        brandImage = (firstProduct.images && firstProduct.images.length > 0) 
          ? firstProduct.images[0] 
          : firstProduct.img || '';
      }
      
      return {
        id: brandName,
        title: brandName,
        image: brandImage,
        count: products.length,
      };
    });

    // Sort alphabetically from A-Z (ascending), but keep "Бусад"/"Other" at the bottom
    brandItems.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      
      // If a is "Бусад" or "Other", it should go to bottom
      if (aLower === "бусад" || aLower === "other" || aLower.includes("бусад") || aLower.includes("other")) {
        return 1;
      }
      // If b is "Бусад" or "Other", it should go to bottom
      if (bLower === "бусад" || bLower === "other" || bLower.includes("бусад") || bLower.includes("other")) {
        return -1;
      }
      // Otherwise, sort alphabetically
      return a.title.localeCompare(b.title, 'mn', { sensitivity: 'base' });
    });

    // Filter out brands without images
    return brandItems.filter(brand => brand.image && brand.image.trim() !== '');
  }, [allProducts]);

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">ачаалж байна...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative rounded-xl p-[1px] overflow-hidden bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 animate-[spin_12s_linear_infinite]" />
      <Card className="relative rounded-xl shadow-sm border border-transparent bg-white">
      
      <CardContent>
        {brands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Брэнд олдсонгүй</div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView="auto"
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={brands.length > 4}
              breakpoints={{
                640: {
                  spaceBetween: 20,
                },
                768: {
                  spaceBetween: 24,
                },
              }}
              className="brands-swiper"
            >
              {brands.map((brand) => (
                <SwiperSlide key={brand.id} style={{ width: 'auto' }}>
                  <Link
                    href={`/products?brand=${encodeURIComponent(brand.id)}`}
                    className="block group"
                  >
                    <div className="relative h-20 md:h-24 w-32 md:w-40 rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-[#1f632b] hover:shadow-md transition-all cursor-pointer">
                      {brand.image ? (
                        <FirebaseImage
                          src={brand.image}
                          alt={brand.title}
                          fill
                          className="object-contain p-2 md:p-3 group-hover:scale-105 transition-transform"
                          sizes="(min-width: 768px) 160px, 128px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <span className="text-xs text-gray-400">{brand.title}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}


