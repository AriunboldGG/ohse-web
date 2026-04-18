"use client";

import FirebaseImage from "@/components/FirebaseImage";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function AboutContent() {
  const { companyInfo } = useCompanyInfo();
  const description =
    companyInfo.aboutDescription ||
    "Манай компанийн тухай мэдээлэл тун удахгүй.";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            БИДНИЙ ТУХАЙ
          </h1>
          <p className="text-black text-base md:text-lg leading-7 whitespace-pre-line">
            {description}
          </p>
        </div>
        <div className="w-full">
          {companyInfo.aboutImageUrl ? (
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-sm">
              <FirebaseImage
                src={companyInfo.aboutImageUrl}
                alt="Company"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full aspect-[4/3] rounded-2xl border bg-gray-50 text-gray-400">
              Зураг байхгүй
            </div>
          )}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Хамтрагч байгууллагууд</h2>
        {companyInfo.partnersImages?.length ? (
          <div className="relative rounded-2xl p-[1px] overflow-hidden bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 animate-[spin_12s_linear_infinite]" />
            <div className="relative rounded-2xl bg-white border border-transparent px-4 py-3 md:px-6 md:py-4">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView="auto"
                grabCursor
                allowTouchMove
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                }}
                loop={companyInfo.partnersImages.length > 1}
                breakpoints={{
                  640: { spaceBetween: 20 },
                  768: { spaceBetween: 24 },
                }}
              >
                {companyInfo.partnersImages.map((image, index) => (
                  <SwiperSlide key={`${image}-${index}`} style={{ width: "auto" }}>
                    <div className="relative h-20 md:h-24 w-32 md:w-40 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                      <FirebaseImage
                        src={image}
                        alt={`Partner ${index + 1}`}
                        fill
                        className="object-contain p-2 md:p-3"
                        sizes="(min-width: 768px) 160px, 128px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Хамтрагч байгууллагын зураг алга байна.</div>
        )}
      </div>
    </div>
  );
}
