"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FirebaseImage from "@/components/FirebaseImage";
import { useCart } from "@/context/CartContext";
import { X, Package, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { QuoteModal } from "@/components/QuoteModal";

export default function CartPage() {
  const { items, removeItem, clear, updateQty } = useCart();
  const [showQuote, setShowQuote] = useState(false);



  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Таны сагс</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">Таны сагс хоосон байна</p>
            <Button className="bg-[#8DC63F] hover:bg-[#7AB82E] cursor-pointer" asChild>
              <a href="/products">Бүтээгдэхүүн харах</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-4 sm:gap-6">
            {/* Left: Cart Items */}
            <div className="space-y-4">
             

              {/* Cart Items */}
              {items.map((item, index) => (
                <Card key={`${item.id}-${item.size || ''}-${item.color || ''}-${item.theme || ''}-${index}`} className="rounded-xl border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="relative w-full sm:w-20 md:w-24 h-24 sm:h-20 md:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.img ? (
                          <FirebaseImage
                            src={item.img}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Зураг байхгүй</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        {/* Title and Remove Button */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-bold text-gray-800">{item.name}</div>
                          <button
                            onClick={() => removeItem(item.id, item)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Product Details - One column, one item per row */}
                        <div className="space-y-1.5 text-xs">
                          {item.price && item.priceNum > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Үнэ:</span>
                              <span className="text-[#1f632b] font-semibold">{item.price} </span>
                            </div>
                          )}
                          {item.product_code && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Барааны код:</span>
                              <span className="text-[#1f632b] font-semibold">{item.product_code}</span>
                            </div>
                          )}
                          {item.modelNumber && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Модел дугаар:</span>
                              <span className="text-[#1f632b] font-semibold">{item.modelNumber}</span>
                            </div>
                          )}
                          {item.size && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Хэмжээ:</span>
                              <span className="text-gray-600">{item.size}</span>
                            </div>
                          )}
                          {item.color && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Өнгө:</span>
                              <span className="text-gray-600">{item.color}</span>
                            </div>
                          )}
                          {item.brand && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Брэнд:</span>
                              <span className="text-gray-600">{item.brand}</span>
                            </div>
                          )}
                          {item.theme && (
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-700 min-w-[100px]">Загвар:</span>
                              <span className="text-gray-600">{item.theme}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-gray-700 min-w-[100px]">Нөөц:</span>
                            <span className={(item.stock ?? 0) > 0 ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                              {(item.stock ?? 0) > 0 ? "Бэлэн байгаа" : "Захиалгаар"}
                            </span>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-3 pt-2">
                          <span className="text-xs font-bold text-gray-700">Тоо ширхэг:</span>
                          <div className="flex items-center border border-gray-200 rounded">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1, item)}
                              className="px-2 py-1 hover:bg-gray-50 text-gray-600 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-sm border-x border-gray-200 min-w-[40px] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1, item)}
                              className="px-2 py-1 hover:bg-gray-50 text-gray-600 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right: Payment Summary */}
            <div className="lg:sticky lg:top-4 h-fit">
              <Card className="rounded-xl border border-gray-200 shadow-sm sticky top-4">
                <CardContent className="p-4 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">Сагсны мэдээлэл</h2>

                  {/* Clear Cart Button */}
                  <Button
                    variant="outline"
                    onClick={clear}
                    className="w-full justify-start gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Сагс хоослох
                  </Button>

                  {/* Item Count */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Бүтээгдэхүүн ({items.length})
                    </div>
                  </div>

                  {/* Send Quote Button */}
                  <Button
                    onClick={() => setShowQuote(true)}
                    className="w-full bg-[#8DC63F] hover:bg-[#7AB82E] text-white cursor-pointer"
                  >
                    Үнийн санал авах
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <QuoteModal 
        open={showQuote} 
        onClose={() => setShowQuote(false)} 
        items={items.length > 0 ? [...items] : []} 
      />
    </main>
  );
}

