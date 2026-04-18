"use client";

import FirebaseImage from "@/components/FirebaseImage";
import { Button } from "@/components/ui/button";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

export default function ContactMapSection() {
  const { companyInfo } = useCompanyInfo();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openFullscreen = (image: string) => {
    setActiveImage(image);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setActiveImage(null);
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <div className="text-sm font-semibold text-gray-800 mb-3">Show room</div>
        {companyInfo.riimImages?.length ? (
          <div className="relative w-full overflow-hidden rounded-lg">
            <div className="pointer-events-none absolute inset-y-0 left-2 right-2 z-10 flex items-center justify-between">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="pointer-events-auto riim-prev h-9 w-9 rounded-full shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="pointer-events-auto riim-next h-9 w-9 rounded-full shadow-md"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={12}
              slidesPerView={1}
              grabCursor
              navigation={{
                prevEl: ".riim-prev",
                nextEl: ".riim-next",
              }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              loop={companyInfo.riimImages.length > 1}
            >
              {companyInfo.riimImages.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <div className="relative w-full h-[260px] md:h-[320px]">
                    <FirebaseImage
                      src={image}
                      alt={`Showroom ${index + 1}`}
                      fill
                      className="object-contain bg-white"
                      sizes="(min-width: 768px) 640px, 100vw"
                    />
                    <button
                      type="button"
                      onClick={() => openFullscreen(image)}
                      className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-colors hover:bg-white"
                      aria-label="Zoom image"
                      title="Zoom"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-[260px] md:h-[320px] rounded-lg border bg-gray-50 text-gray-400">
            Зураг байхгүй
          </div>
        )}
      </div>

      {isFullscreen && activeImage ? (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <button
            type="button"
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-full max-w-5xl max-h-[90vh] aspect-video">
            <FirebaseImage
              src={activeImage}
              alt="Showroom fullscreen"
              fill
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
