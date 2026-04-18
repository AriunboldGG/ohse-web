import type { Metadata } from "next";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import Brands from "@/components/Brands";
import ProductTabsSlider from "@/components/ProductTabsSlider";
import ProductSectors from "@/components/ProductSectors";
import PromoBanner from "@/components/PromoBanner";
import Suggestions from "@/components/Suggestions";

export const metadata: Metadata = {
  title: "Нүүр хуудас",
  description: "ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл, ажлын байрны тохилог орчны бүтээгдэхүн. OHSE компаниас чанартай, найдвартай бүтээгдэхүн худалдан аваарай.",
  openGraph: {
    title: "OHSE - Хамгаалах хувцас хэрэгсэл, багаж хэрэгсэл",
    description: "ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл нийлүүлнэ",
    url: "/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
        {/* Brands under Slider */}
      <section className="container mx-auto px-4 mt-10 md:mt-14">
        <Brands />
      </section>
      {/* Main Slider */}
      <section className="container mx-auto px-4 mt-10 md:mt-14">
            <HeroSlider />
      </section>
    
    
      <section className="container mx-auto px-4 mt-10 md:mt-14">
        <ProductTabsSlider />
      </section>
   
      {/* <section className="container mx-auto px-4 mt-6 md:mt-8">
        <Suggestions />
      </section> */}
    </main>
  );
}
